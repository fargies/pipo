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
 ** test_HTMLFetcher
 **
 **        Created on: 12/20/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>
#include <QTemporaryFile>
#include <QTextStream>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "HTMLFetcher.hpp"
#include "StdioOut.hpp"
#include "test_helpers.hpp"
#include "stub_HTTPServer.hpp"
#include "SignalWaiter.hpp"

using namespace testHelpers;

class HTTPChunkedServerStub : public HTTPServerStub
{
public:
    void handle(const QString &url, QTcpSocket &socket);

    QByteArray data;
};


void HTTPChunkedServerStub::handle(const QString &url, QTcpSocket &socket)
{
    if (url == "/test")
    {
        socket.write("HTTP/1.1 200 Ok\r\n"
                     "Content-Type: application/octet-stream\r\n"
                     "Transfer-Encoding: chunked\r\n"
                     "\r\n");
        for (int i = 0;
             i < data.size();
             )
        {
            int len = qMin(data.size() - i, 3); /* small chunks */
            socket.write(qPrintable(QString::number(len, 16)));
            socket.write("\r\n");
            socket.write(data.mid(i, len));
            socket.write("\r\n");
            socket.flush();
            i += len;

        }
        socket.write("0\r\n\r\n");
        socket.flush();
    }
    else
        HTTPServerStub::handle(url, socket);
}

class HTMLFetcherTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(HTMLFetcherTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(chunked);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        HTTPServerStub server;
        QTemporaryFile tempFile;

        Item item;
        item.insert("url", server.baseUri() + "/test");

        HTMLFetcher fetcher;
        StdioOut out;
        fetcher.next(out);

        {
            tempFile.open();
            QTextStream tempStream(&tempFile);

            tempStream << "<html><body><div>"
                       << "<div id=\"catchme\"><div param=\"42\">value str</div></div>"
                       << "</div></body></html>";
            tempStream.flush();
            server.add("/test", tempFile.fileName());
        }

        SignalWaiter waiter(&fetcher, SIGNAL(itemOut(Item)));
        fetcher.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(1000));
    }

    void chunked()
    {
        HTTPChunkedServerStub server;

        {
            qsrand(time(0));
            QByteArray arr;

            arr.reserve(1024);
            for (int i = 0; i < arr.capacity(); ++i)
                arr.append(static_cast<char>(qrand()));
            server.data = arr;
        }

        QTemporaryFile tempFile;
        CPPUNIT_ASSERT(tempFile.open());

        Item item;
        item.insert("url", server.baseUri() + "/test");
        item.insert("htmlOutFile", tempFile.fileName());

        HTMLFetcher fetcher;
        StdioOut out;
        fetcher.next(out);

        SignalWaiter waiter(&fetcher, SIGNAL(finished(int)));
        fetcher.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(3000));

        QByteArray data = tempFile.readAll();

        CPPUNIT_ASSERT(data == server.data);
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(HTMLFetcherTest);
