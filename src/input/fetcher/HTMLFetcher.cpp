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

#include "HTMLFetcher.hpp"
#include "HttpCodes.hpp"
#include "SignalWaiter.hpp"
#include "ErrorItem.hpp"

#define NET_TIMEOUT 35000

HTMLFetcher::HTMLFetcher(QObject *parent) :
    InputPipe(parent),
    m_async(false)
{
}

HTMLFetcher::HTMLFetcher(const QString &url, QObject *parent) :
    InputPipe(parent),
    m_url(url),
    m_async(false)
{
}

QString HTMLFetcher::usage(const QString &usage)
{
    return usage + "\nHTMLFetcher \"url\" -> { \"html\" : \"<htmldata>\" }\n"
                   "{ \"url\" : \"<url>\" } -> HTMLFetcher -> { \"html\" : \"<htmldata>\" }\n";
}

bool HTMLFetcher::itemIn(const Item &item)
{
    const QString url = item.value("url").toString();

    if (Pipe::itemIn(item))
        return true;
    else if (url.isEmpty())
        emit itemOut(item);
    else
    {
        QNetworkRequest request;
        request.setUrl(url);
        request.setRawHeader("User-Agent", "Pipo 1.0");

        m_pendingCount++;

        QNetworkReply *reply = m_manager.get(request);
        reply->setProperty("requestItem", item);

        if (m_async)
        {
            connect(reply, SIGNAL(finished()),
                    this, SLOT(onRequestFinished()));
        }
        else
        {
            SignalWaiter waiter(reply, SIGNAL(finished()));
            while (!reply->isFinished() && !waiter.wait(NET_TIMEOUT))
                emit itemOut(ErrorItem("request is slow on %1").arg(url));
            processReply(reply);
            reply->deleteLater();

            if (!--m_pendingCount && !m_connCount)
                emit finished(0);
        }
    }
    return true;
}

void HTMLFetcher::start()
{
    QNetworkRequest request;
    request.setUrl(m_url);
    request.setRawHeader("User-Agent", "Pipo 1.0");

    m_pendingCount++;

    Item item;
    item.insert("url", m_url);

    QNetworkReply *reply = m_manager.get(request);
    reply->setProperty("requestItem", item);

    connect(reply, SIGNAL(finished()),
            this, SLOT(onRequestFinished()));
}

void HTMLFetcher::setUrl(const QString &url)
{
    m_url = url;
}

void HTMLFetcher::setAsync(bool value)
{
    m_async = value;
}

void HTMLFetcher::onRequestFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply *>(sender());

    if (!reply)
        emit itemOut(ErrorItem("internal error in HTMLFetcher"));
    else
    {
        processReply(reply);
        reply->deleteLater();
    }
    if (!--m_pendingCount && !m_connCount)
        emit finished(0);

}

void HTMLFetcher::onPrevFinished(int status)
{
    if (!--m_connCount && !m_pendingCount)
        emit finished(status);
}

void HTMLFetcher::processReply(QNetworkReply *reply)
{
    const Item item(reply->property("requestItem").toJsonObject());

    if (reply->error() != QNetworkReply::NoError)
        emit itemOut(ErrorItem("network request failed for '%1': %2")
                     .arg(reply->url().toString()).arg(reply->errorString()));
    else
    {
        int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        if (httpStatus == HTTP_OK)
            processData(item, reply->readAll());
        else
            emit itemOut(ErrorItem(QString("failed with status: %1").arg(httpStatus)));
    }
}

void HTMLFetcher::processData(const Item &item, const QByteArray &data)
{
    Item out(item);
    out.remove("url");

    out.insert("html", QString(data));
    emit itemOut(out);
}

PIPE_REGISTRATION(HTMLFetcher)
