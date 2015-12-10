/**
 ** Copyright (C) 2015 fargie_s
 **
 ** This software is provided 'as-is', without any express or implied
 ** warranty.  In no event will the authors be held liable for any damages
 ** arising from the use of this software.
 **
 ** Permission is granted to anyone to use this software for any purpose,
 ** including commercial applications, and to alter it and redistribute it
 ** freely, subject to the following restrictions:
 **
 ** 1. The origin of this software must not be misrepresented; you must not
 **    claim that you wrote the original software. If you use this software
 **    in a product, an acknowledgment in the product documentation would be
 **    appreciated but is not required.
 ** 2. Altered source versions must be plainly marked as such, and must not be
 **    misrepresented as being the original software.
 ** 3. This notice may not be removed or altered from any source distribution.
 **
 **
 **
 **        Created on: 12/10/2015
 **   Original Author: fargie_s
 **
 **/

#include <QProcess>
#include <QTextStream>
#include <QDebug>

#include "MailOut.hpp"
#include "ErrorItem.hpp"

MailOut::MailOut(QObject *parent) :
    Pipe(parent),
    m_async(false)
{
}

bool MailOut::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item out(item);
    QString from = out.take("from").toString(m_from);
    QString to = out.take("to").toString(m_to);
    QString subject = out.take("subject").toString(m_subject);

    if (from.isEmpty() || to.isEmpty())
    {
        emit itemOut(item);
        return true;
    }

    QProcess *sendMail = new QProcess(this);
    if (m_async)
    {
        connect(sendMail, SIGNAL(finished(int,QProcess::ExitStatus)),
                this, SLOT(onSendmailFinished(int,QProcess::ExitStatus)));
        connect(sendMail, SIGNAL(error(QProcess::ProcessError)),
                this, SLOT(onSendmailError(QProcess::ProcessError)));
    }

    sendMail->start("sendmail", QStringList() << "-t", QProcess::WriteOnly);

    QTextStream mail(sendMail);
    mail << "To: " << to << "\r\n"
         << "From: " << from << "\r\n";
    if (!subject.isEmpty())
        mail << "Subject: " << subject;

    QJsonObject headers = out.take("headers").toObject();
    if (!headers.isEmpty())
    {
        for (QJsonObject::const_iterator it = headers.constBegin();
             it != headers.constEnd();
             ++it)
            mail << it.key() << ": " << it.value().toString() << "\r\n";
    }
    mail << "\r\n"
         << out.take("content").toString() << "\r\n";
    mail.flush();
    sendMail->closeWriteChannel();

    if (!m_async)
    {
        if (sendMail->error() != QProcess::UnknownError)
            emit itemOut(ErrorItem("failed to start sendmail"));
        if (!sendMail->waitForFinished())
        {
            sendMail->terminate();
            sendMail->kill();
            emit itemOut(ErrorItem("sendmail process did not end properly"));
        }
        else if ((sendMail->exitStatus() != QProcess::NormalExit) ||
                (sendMail->exitCode() != 0))
            emit itemOut(ErrorItem("sendmail process ended up with an error"));

        sendMail->deleteLater();
        if (!out.isEmpty())
            emit itemOut(out);
    }
    else
    {
        if (!out.isEmpty())
            sendMail->setProperty("itemIn", out);
    }

}

QString MailOut::usage(const QString &usage)
{
    return usage + "\n"
            "{\n"
            "  \"to\" : \"dest <dest@somwhere.com>\",\n"
            "  \"from\" \"src <src@somwhere.com>\",\n"
            "  \"subject\" : \"subject\",\n"
            "  \"content\" : \"content\",\n"
            "  \"headers\" : { \"X-Bogosity\" : 0.12 }\n} -> MailOut\n"
                   "{ \"MailOutConfig\" : { \"to\" ... }";
}

void MailOut::setFrom(const QString &from)
{
    m_from = from;
}

void MailOut::setTo(const QString &to)
{
    m_to = to;
}

void MailOut::setSubject(const QString &subject)
{
    m_subject = subject;
}

void MailOut::setHeaders(const QHash<QString, QString> &headers)
{
    m_headers = headers;
}

void MailOut::setAsync(bool value)
{
    m_async = value;
}

void MailOut::onSendmailFinished(int exitCode, QProcess::ExitStatus exitStatus)
{
    QProcess *sendMail = qobject_cast<QProcess*>(sender());

    if ((exitStatus != QProcess::NormalExit) ||
            (exitCode != 0))
        emit itemOut(ErrorItem("sendmail process ended up with an error"));

    if (sendMail)
    {
        Item out(sendMail->property("itemIn").toJsonObject());
        if (!out.isEmpty())
            emit itemOut(out);

        sendMail->deleteLater();
    }
}

void MailOut::onSendmailError(QProcess::ProcessError /*error*/)
{
    QProcess *sendMail = qobject_cast<QProcess*>(sender());
    emit itemOut(ErrorItem("failed to start sendmail"));

    if (sendMail)
    {
        Item out(sendMail->property("itemIn").toJsonObject());
        if (!out.isEmpty())
            emit itemOut(out);

        sendMail->deleteLater();
    }
}
