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

#ifndef MAILOUT_HPP
#define MAILOUT_HPP

#include <QObject>
#include <QHash>
#include <QString>
#include <QProcess>

#include "Pipe.hpp"

class MailOut : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(bool async READ async WRITE setAsync)
    Q_PROPERTY(QString from READ from WRITE setFrom)
    Q_PROPERTY(QString to READ to WRITE setTo)
    Q_PROPERTY(QString subject READ subject WRITE setSubject)
    Q_PROPERTY(Headers headers READ headers WRITE setHeaders)
public:
    Q_INVOKABLE
    MailOut(QObject *parent = 0);

    typedef QHash<QString, QString> Headers;

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    inline QString from() const
    { return m_from; }
    void setFrom(const QString &from);

    inline QString to() const
    { return m_to; }
    void setTo(const QString &to);

    inline QString subject() const
    { return m_subject; }
    void setSubject(const QString &subject);

    inline const QHash<QString, QString> &headers() const
    { return m_headers; }
    void setHeaders(const QHash<QString, QString> &headers);

    inline bool async() const
    { return m_async; }
    void setAsync(bool value);

protected slots:
    void onSendmailFinished(int exitCode, QProcess::ExitStatus exitStatus);
    void onSendmailError(QProcess::ProcessError error);

protected:
    bool m_async;
    QString m_from;
    QString m_to;
    QString m_subject;
    QHash<QString, QString> m_headers;
};

#endif // MAILOUT_HPP
