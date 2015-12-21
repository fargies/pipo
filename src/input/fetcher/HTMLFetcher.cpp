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
 **        Created on: 12/5/2015
 **   Original Author: fargie_s
 **
 **/

#include <QNetworkReply>
#include <QNetworkRequest>
#include <QFile>

#include "HTMLFetcher.hpp"
#include "HttpCodes.hpp"
#include "SignalWaiter.hpp"
#include "ErrorItem.hpp"

#define NET_TIMEOUT 35000

HTMLFetcher::HTMLFetcher(QObject *parent) :
    InputPipe(parent),
    m_pendingCount(0)
{
}

HTMLFetcher::HTMLFetcher(const QString &url, QObject *parent) :
    InputPipe(parent),
    m_url(url),
    m_pendingCount(0)
{
}

QString HTMLFetcher::usage(const QString &usage)
{
    return usage + "\nHTMLFetcher \"url\" -> { \"html\" : \"<htmldata>\" }\n"
                   "{ \"url\" : \"<url>\" } -> HTMLFetcher -> { \"html\" : \"<htmldata>\" }\n";
}

bool HTMLFetcher::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item outItem = setConfigProperties(item);
    const QString url = outItem.take("url").toString();
    if (url.isEmpty())
    {
        if (!outItem.isEmpty())
            emit itemOut(outItem);
    }
    else
    {
        QNetworkRequest request;
        request.setUrl(url);
        request.setRawHeader("User-Agent", "Pipo 1.0");

        QString outFile = outItem.take("htmlOutFile").toString(m_outFile);
        if (!outFile.isEmpty())
        {
            QFile file(outFile);
            if (!file.open(QIODevice::Truncate | QIODevice::WriteOnly))
            {
                emit itemOut(ErrorItem("failed to open htmlOutFile: %1")
                             .arg(file.errorString()));
                return true;
            }
            file.close();
        }
        else
            outItem.remove("html");

        m_pendingCount++;

        QNetworkReply *reply = m_manager.get(request);
        reply->setProperty("requestItem", outItem);
        if (!outFile.isEmpty())
            reply->setProperty("htmlOutFile", outFile);
        reply->setReadBufferSize(4096 * 1024);

        connect(reply, &QNetworkReply::downloadProgress,
                this, &HTMLFetcher::onReadyRead);
        connect(reply, &QNetworkReply::finished,
                this, &HTMLFetcher::onReadyRead);
    }
    return true;
}

void HTMLFetcher::start()
{
    Item item;
    item.insert("url", m_url);

    itemIn(item);
}

void HTMLFetcher::setUrl(const QString &url)
{
    m_url = url;
}

void HTMLFetcher::setOutFile(const QString &outFile)
{
    m_outFile = outFile;
}

void HTMLFetcher::onReadyRead()
{
    bool pending = false;
    QNetworkReply *reply = qobject_cast<QNetworkReply *>(sender());

    if (reply)
    {
        pending = processReply(reply);
        if (!pending)
            reply->deleteLater();
    }
    else
        emit itemOut(ErrorItem("internal error in %1")
                     .arg(metaObject()->className()));

    if (!pending)
    {
        if (!--m_pendingCount && !m_connCount)
            emit finished(0);
    }
}

void HTMLFetcher::onPrevFinished(int status)
{
    if (!--m_connCount && !m_pendingCount)
        emit finished(status);
}

bool HTMLFetcher::processReply(QNetworkReply *reply)
{
    if (reply->error() != QNetworkReply::NoError)
    {
        emit itemOut(ErrorItem("network request failed for '%1': %2")
                     .arg(reply->url().toString()).arg(reply->errorString()));
        return false;
    }
    int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();

    if (httpStatus != HTTP_OK)
    {
        emit itemOut(ErrorItem(QString("failed with status: %1").arg(httpStatus)));
        return false;
    }

    Item item(reply->property("requestItem").toJsonObject());
    bool pending = false;

    qint64 size = reply->header(QNetworkRequest::ContentLengthHeader).toULongLong();
    qint64 fetched = processData(reply->property("htmlOutFile").toString(),
                                 reply->read(reply->bytesAvailable()), item);
    if (size > 0)
    {
        if (fetched >= size)
            sendItemOut(item);
        else if (reply->isFinished())
            emit itemOut(ErrorItem("missing data, Content-Length: %1 < %2")
                         .arg(QString::number(fetched))
                         .arg(QString::number(size)));
        else
            pending = true;
    }
    else if (reply->isFinished())
        sendItemOut(item);
    else
        pending = true;

    if (pending)
        reply->setProperty("requestItem", item);
    else
        reply->disconnect(this);
    return pending;
}

qint64 HTMLFetcher::processData(const QString &outFile, const QByteArray &data, Item &item)
{
    qint64 size;

    if (!outFile.isEmpty())
    {
        QFile file(outFile);
        file.open(QIODevice::Append | QIODevice::WriteOnly);
        file.write(data);
        size = file.size();
        file.close();
    }
    else
    {
        const QString html = item.value("html").toString();
        item.insert("html", html + QString(data));
        size = html.size() + data.size();
    }
    return size;
}

void HTMLFetcher::sendItemOut(Item &item)
{
    if (!item.isEmpty())
        emit itemOut(item);
}

PIPE_REGISTRATION(HTMLFetcher)
