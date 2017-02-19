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
 **        Created on: 11/29/2015
 **   Original Author: fargie_s
 **
 **/

#include <QNetworkProxy>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QJsonArray>
#include <QSslCipher>
#include <QDebug>

#include "ProxyTester.hpp"
#include "HttpCodes.hpp"
#include "ErrorItem.hpp"
#include "SignalWaiter.hpp"

#define NET_TIMEOUT 35000

ProxyTester::ProxyTester(QObject *parent) :
    Pipe(parent),
    m_testServer("https://www.google.fr/"),
    m_pendingCount(0),
    m_requestCount(5),
    m_async(false)
{
    m_elapsedTimer.start();
}

void ProxyTester::setTestServer(const QString &server)
{
    m_testServer = server;
}

void ProxyTester::setAsync(bool value)
{
    m_async = value;
}

void ProxyTester::setRequestCount(int count)
{
    m_requestCount = count;
}

QNetworkProxy::ProxyType ProxyTester::proxyType(const QString &name)
{
    if (name.compare("http", name, Qt::CaseInsensitive) == 0)
        return QNetworkProxy::HttpProxy;
    else if (name.compare("default", name, Qt::CaseInsensitive) == 0)
        return QNetworkProxy::DefaultProxy;
    else if (name.compare("socks5", name, Qt::CaseInsensitive) == 0)
        return QNetworkProxy::Socks5Proxy;
    else if (name.compare("httpcache", name, Qt::CaseInsensitive) == 0)
        return QNetworkProxy::HttpCachingProxy;
    else if (name.compare("ftp", name, Qt::CaseInsensitive) == 0)
        return QNetworkProxy::FtpCachingProxy;
    else
        return QNetworkProxy::NoProxy;
}

bool ProxyTester::itemIn(const Item &item)
{
    const QString hostName = item.value("hostName").toString();
    const QJsonValue jsonPort = item.value("port");

    const int port = jsonPort.isString() ? jsonPort.toString().toInt() : jsonPort.toInt(-1);
    QNetworkProxy::ProxyType type = proxyType(item.value("type").toString("http"));

    if (Pipe::itemIn(item))
        return true;
    else if (hostName.isEmpty() || (port <= 0))
        emit itemOut(item);
    else
    {
        QNetworkProxy proxy(type, hostName, port,
                            item.value("user").toString(),
                            item.value("password").toString());
        m_manager.setProxy(proxy);

        QNetworkRequest request;
        request.setUrl(m_testServer);
        request.setRawHeader("User-Agent", "Pipo 1.0");

        m_pendingCount++;

        QNetworkReply *reply = m_manager.get(request);
        reply->setProperty("startTime", (uint) m_elapsedTimer.elapsed());
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
                emit itemOut(ErrorItem("request is slow on %1").arg(hostName));
            processReply(reply);
            reply->deleteLater();

            if (!--m_pendingCount && !m_connCount)
                emit finished(0);
        }
    }
}

void ProxyTester::onRequestFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply *>(sender());

    if (!reply)
         emit itemOut(ErrorItem("internal error in ProxyTester"));
    else
    {
        processReply(reply);
        reply->deleteLater();
    }
    if (!--m_pendingCount && !m_connCount)
        emit finished(0);
}

void ProxyTester::onPrevFinished(int status)
{
    if (!--m_connCount && !m_pendingCount)
        emit finished(status);
}

void ProxyTester::processReply(QNetworkReply *reply)
{
    Item proxyItem(reply->property("requestItem").toJsonObject());
    int requestCount = proxyItem.value("requestCount").toInt(0) + 1;
    proxyItem.insert("requestCount", requestCount);

    if (reply->error() != QNetworkReply::NoError)
        emit itemOut(ErrorItem("network request failed for '%1': %2")
                     .arg(reply->url().toString()).arg(reply->errorString()));
    else
    {
        int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        if (httpStatus == HTTP_OK)
        {
            QJsonArray timings(proxyItem.value("timings").toArray());
            timings.append(m_elapsedTimer.elapsed() - reply->property("startTime").toUInt());
            proxyItem.insert("timings", timings);
        }
        else
            emit itemOut(ErrorItem(QString("failed with status: %1").arg(httpStatus)));
    }
    if (requestCount < m_requestCount)
        itemIn(proxyItem);
    else if (proxyItem.contains("timings")) /* at least one successful request */
        emit itemOut(proxyItem);
}

PIPE_REGISTRATION(ProxyTester)
