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
 ** test_ZalmosFetcher
 **
 **        Created on: 12/14/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QNetworkCookieJar>
#include <QNetworkCookie>
#include <QCoreApplication>

#include "ZalmosFetcher.hpp"
#include "StdioOut.hpp"
#include "test_helpers.hpp"
#include "SignalWaiter.hpp"
#include "HttpCodes.hpp"

using namespace testHelpers;

class ZalmosFetcherTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(ZalmosFetcherTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(test);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        ZalmosFetcher fetcher;
        StdioOut out;
        fetcher.next(out);

        Item item;
        item["url"] = "http://142.4.214.205/VMs/Ubuntu/15.04/VirtualBox_-_Ubuntu-15.05-64bit-Desktop_VDI-%5bVirtualBoxImages.com%5d.rar";

        SignalWaiter waiter(&out, SIGNAL(finished(int)));
        fetcher.itemIn(item);

        CPPUNIT_ASSERT(waiter.wait(30000));
    }

    void test()
    {
        QNetworkAccessManager mgr;
        QNetworkRequest req;

        req.setUrl(QString("http://proxy.zalmos.com/"));
        req.setHeader(QNetworkRequest::UserAgentHeader,
                      "Pipo 1.0");

        QNetworkReply *reply = mgr.get(req);
        CPPUNIT_ASSERT(reply);
        {
            SignalWaiter waiter(reply, SIGNAL(finished()));
            CPPUNIT_ASSERT(waiter.wait(30000));

            CPPUNIT_ASSERT(reply->error() == QNetworkReply::NoError);
            int httpStatus =
                    reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
            qDebug() << httpStatus << reply->url();
        }
        QList<QNetworkCookie> jar = mgr.cookieJar()->cookiesForUrl(reply->url());

        for (QList<QNetworkCookie>::iterator it = jar.begin();
             it != jar.end();
             )
        {
            qDebug() << it->name();
            if (it->name() != "s")
                it = jar.erase(it);
            else
                ++it;
        }
        qDebug() << "cookies in jar: " << jar.size();

        req = QNetworkRequest();
        req.setUrl(QString("https://proxy.zalmos.com/includes/process.php?action=update"));
        req.setHeader(QNetworkRequest::ContentTypeHeader,
                      "application/x-www-form-urlencoded");
        req.setHeader(QNetworkRequest::CookieHeader,
                      QVariant::fromValue(jar));
        req.setRawHeader("Accept", "*/*");
        req.setRawHeader("Origin", "http://www.zalmos.com/");
        req.setRawHeader("Referer", "http://www.zalmos.com/");
        req.setRawHeader("Upgrade-Insecure-Requests", "0");
        req.setHeader(QNetworkRequest::UserAgentHeader,
                      "Pipo 1.0");

        QUrl postData;
        postData.addQueryItem("u", "http://www.google.fr");
        reply = mgr.post(req, postData.encodedQuery());
        {
            SignalWaiter waiter(reply, SIGNAL(finished()));
            CPPUNIT_ASSERT(waiter.wait(30000));
            CPPUNIT_ASSERT(reply->error() == QNetworkReply::NoError);
            int httpStatus =
                    reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
            CPPUNIT_ASSERT_EQUAL(HTTP_TEMP_MOVED, httpStatus);
        }

        req = QNetworkRequest();
        qDebug() << reply->header(QNetworkRequest::LocationHeader).toString();
        req.setUrl(reply->header(QNetworkRequest::LocationHeader).toString());
        req.setHeader(QNetworkRequest::CookieHeader,
                      QVariant::fromValue(jar));
        req.setRawHeader("Accept", "*/*");
        req.setRawHeader("Origin", "http://www.zalmos.com/");
        req.setRawHeader("Referer", "http://www.zalmos.com/");
        req.setRawHeader("Upgrade-Insecure-Requests", "0");
        req.setHeader(QNetworkRequest::UserAgentHeader,
                      "Pipo 1.0");
        reply = mgr.get(req);
        {
            SignalWaiter waiter(reply, SIGNAL(finished()));
            CPPUNIT_ASSERT(waiter.wait(30000));
            CPPUNIT_ASSERT(reply->error() == QNetworkReply::NoError);
            int httpStatus =
                    reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
            qDebug() << httpStatus;
            qDebug() << reply->readAll();
        }

        qDebug() << reply->rawHeaderPairs();
        req = QNetworkRequest();
        qDebug() << reply->header(QNetworkRequest::LocationHeader).toString();
        req.setUrl(reply->header(QNetworkRequest::LocationHeader).toString());
        req.setHeader(QNetworkRequest::CookieHeader,
                      QVariant::fromValue(jar));
        req.setRawHeader("Accept", "*/*");
        req.setRawHeader("Origin", "http://www.zalmos.com/");
        req.setRawHeader("Referer", "http://www.zalmos.com/");
        req.setRawHeader("Upgrade-Insecure-Requests", "0");
        req.setHeader(QNetworkRequest::UserAgentHeader,
                      "Pipo 1.0");
        reply = mgr.get(req);
        {
            SignalWaiter waiter(reply, SIGNAL(finished()));
            CPPUNIT_ASSERT(waiter.wait(30000));
            CPPUNIT_ASSERT(reply->error() == QNetworkReply::NoError);
            int httpStatus =
                    reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
            qDebug() << httpStatus;
            qDebug() << reply->readAll();
        }

        qDebug() << reply->rawHeaderPairs();
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(ZalmosFetcherTest);
