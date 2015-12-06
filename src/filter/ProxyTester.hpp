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

#ifndef PROXYTESTER_HPP
#define PROXYTESTER_HPP

#include <QNetworkAccessManager>
#include <QElapsedTimer>
#include <QNetworkProxy>

#include "Pipe.hpp"

class QNetworkReply;

class ProxyTester : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(bool async READ isAsync WRITE setAsync)
    Q_PROPERTY(int requestCount READ requestCount WRITE setRequestCount)
    Q_CLASSINFO("args", "{ port: 1234, hostName: \"10.1.10.1\", type: \"[http,socks5]\" }")
    Q_CLASSINFO("optargs", "{ user: \"username\", password: \"pass\" }")
    Q_CLASSINFO("output", "{ timings: [ 1500, 1200 ], requestCount: 2 }")
public:
    Q_INVOKABLE
    ProxyTester(QObject *parent = 0);

    virtual bool itemIn(const Item &item);

    inline const QString &testServer() const
    { return m_testServer; }
    void setTestServer(const QString &server);

    inline bool isAsync() const
    { return m_async; }
    void setAsync(bool value);

    inline int requestCount() const
    { return m_requestCount; }
    void setRequestCount(int count);

    static QNetworkProxy::ProxyType proxyType(const QString &name);

protected slots:
    void onRequestFinished();
    void onPrevFinished(int status);

protected:
    void processReply(QNetworkReply *reply);

    QString m_testServer;
    QNetworkAccessManager m_manager;
    QElapsedTimer m_elapsedTimer;
    int m_pendingCount;
    int m_requestCount;
    bool m_async;
};

#endif // PROXYTESTER_HPP
