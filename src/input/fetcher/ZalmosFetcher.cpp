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
 **        Created on: 12/12/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>

#include <QNetworkReply>
#include <QNetworkRequest>
#include <QNetworkCookieJar>
#include <QNetworkCookie>
#include <QFile>

#include "ZalmosFetcher.hpp"
#include "ErrorItem.hpp"
#include "HttpCodes.hpp"
#include "SignalWaiter.hpp"

#define NET_TIMEOUT 35000
#define ZALMOS_URL "https://www.zalmos.com"
#define ZALMOS_HTTP_URL "http://www.zalmos.com"
#define ZALMOS_PROXY_HTTP_URL "http://proxy.zalmos.com/"
#define ZALMOS_REQUEST_URL "https://proxy.zalmos.com/includes/process.php?action=update"

ZalmosFetcher::ZalmosFetcher(QObject *parent) :
    HTMLFetcher(parent)
{
}

ZalmosFetcher::ZalmosFetcher(const QString &url, QObject *parent) :
    HTMLFetcher(url, parent)
{
}

bool ZalmosFetcher::itemIn(const Item &item)
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
        QNetworkRequest req;
        req.setUrl(QString(ZALMOS_PROXY_HTTP_URL));
        req.setHeader(QNetworkRequest::UserAgentHeader, "Pipo 1.0");

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

        QNetworkReply *reply = m_manager.get(req);
        reply->setProperty("requestItem", item);
        if (!outFile.isEmpty())
            reply->setProperty("htmlOutFile", outFile);

        connect(reply, &QNetworkReply::finished,
                this, &ZalmosFetcher::fetchCookiesReply);
    }

    return true;
}

void ZalmosFetcher::start()
{
    Item item;
    item.insert("url", m_url);

    itemIn(item);
}

QString ZalmosFetcher::usage(const QString &usage)
{
    return usage + "\nZalmosFetcher \"url\" -> { \"html\" : \"<htmldata>\" }\n"
                   "{ \"url\" : \"<url>\" } -> HTMLFetcher -> { \"html\" : \"htmldata\" }\n";
}

bool ZalmosFetcher::fetchCookiesReply()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());
    bool ret = false;
    if (!reply)
    {
        qWarning() << "internal error";
        return false;
    }

    int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
    if (reply->error() != QNetworkReply::NoError)
        emit itemOut(ErrorItem("network request failed for '%1': %2")
                     .arg(reply->url().toString()).arg(reply->errorString()));
    else if (httpStatus != HTTP_OK)
        emit itemOut(ErrorItem(QString("failed with status: %1").arg(httpStatus)));
    else
    {
        const Item item(reply->property("requestItem").toJsonObject());

        /* filter cookies */
        QList<QNetworkCookie> jar = m_manager.cookieJar()->cookiesForUrl(
                    reply->url());
        for (QList<QNetworkCookie>::iterator it = jar.begin();
             it != jar.end();
             )
        {
            if (it->name() != "s")
                it = jar.erase(it);
            else
                ++it;
        }

        QNetworkReply *newRep = fetchPage(item, jar);
        if (reply->property("htmlOutFile").isValid())
            newRep->setProperty("htmlOutFile", reply->property("htmlOutFile"));

        reply->deleteLater();
        return true;
    }

    if (!--m_pendingCount && !m_connCount)
        emit finished(0);
    reply->deleteLater();
    return false;
}

QNetworkReply *ZalmosFetcher::fetchPage(const Item &item, const QList<QNetworkCookie> &cookies)
{
    QNetworkRequest req;
    req.setUrl(QString(ZALMOS_REQUEST_URL));
    req.setHeader(QNetworkRequest::ContentTypeHeader,
                  "application/x-www-form-urlencoded");
    req.setHeader(QNetworkRequest::CookieHeader, QVariant::fromValue(cookies));
    req.setRawHeader("Accept", "*/*");
    req.setRawHeader("Origin", ZALMOS_HTTP_URL);
    req.setRawHeader("Referer", ZALMOS_HTTP_URL);
    req.setRawHeader("Upgrade-Insecure-Requests", "0");
    req.setHeader(QNetworkRequest::UserAgentHeader, "Pipo 1.0");

    QUrl postData;
    postData.addQueryItem("u", item.value("url").toString());

    QNetworkReply *reply = m_manager.post(req, postData.encodedQuery());
    reply->setProperty("requestItem", item);

    connect(reply, &QNetworkReply::readyRead,
            this, &ZalmosFetcher::onReadyRead);
    connect(reply, &QNetworkReply::finished,
            this, &ZalmosFetcher::onReadyRead);
    return reply;
}

bool ZalmosFetcher::processReply(QNetworkReply *reply)
{
    if (reply->error() != QNetworkReply::NoError)
    {
        emit itemOut(ErrorItem("network request failed for '%1': %2")
                     .arg(reply->url().toString()).arg(reply->errorString()));
        return false;
    }

    int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
    if (httpStatus == HTTP_TEMP_MOVED)
    {
        QList<QNetworkCookie> jar = qvariant_cast<QList<QNetworkCookie> >(
                    reply->request().header(QNetworkRequest::CookieHeader));
        QString url = reply->header(QNetworkRequest::LocationHeader).toString();

        QNetworkRequest req;
        req.setUrl(url);
        req.setHeader(QNetworkRequest::CookieHeader, QVariant::fromValue(jar));
        req.setRawHeader("Accept", "*/*");
        req.setRawHeader("Origin", ZALMOS_HTTP_URL);
        req.setRawHeader("Referer", ZALMOS_HTTP_URL);
        req.setRawHeader("Upgrade-Insecure-Requests", "0");

        QNetworkReply *newRep = m_manager.get(req);
        newRep->setProperty("requestItem", reply->property("requestItem"));
        if (reply->property("htmlOutFile").isValid())
            newRep->setProperty("htmlOutFile", reply->property("htmlOutFile"));
        newRep->setReadBufferSize(4096);

        connect(newRep, &QNetworkReply::readyRead,
                this, &ZalmosFetcher::onReadyRead);
        connect(newRep, &QNetworkReply::finished,
                this, &ZalmosFetcher::onReadyRead);

        reply->disconnect(this);
        reply->deleteLater();

        return true;
    }
    else
        return HTMLFetcher::processReply(reply);
}

PIPE_REGISTRATION(ZalmosFetcher)
