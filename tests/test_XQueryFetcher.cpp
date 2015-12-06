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
 **        Created on: 12/3/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>
#include <QTemporaryFile>
#include <QTextStream>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "XQueryFetcher.hpp"
#include "StdioOut.hpp"
#include "test_helpers.hpp"
#include "stub_HTTPServer.hpp"
#include "SignalWaiter.hpp"

using namespace testHelpers;

class XQueryFetcherTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(XQueryFetcherTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        HTTPServerStub server;
        QTemporaryFile tempFile;

        QJsonObject subQuery;
        subQuery.insert("value", "text()");
        subQuery.insert("param", "@param/string()");
        XQueryFetcher fetcher(server.baseUri() + "/test",
                              "//div[contains(@id,'catchme')]/div",
                              subQuery);
        StdioOut out;
        fetcher.next(out);

        tempFile.open();
        QTextStream tempStream(&tempFile);

        tempStream << "<html><body><div>"
                   << "<div id=\"catchme\"><div param=\"42\">value str</div></div>"
                   << "</div></body></html>";
        tempStream.flush();
        server.add("/test", tempFile.fileName());

        SignalWaiter waiter(&fetcher, SIGNAL(itemOut(Item)));
        fetcher.start();
        CPPUNIT_ASSERT(waiter.wait(1000));
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(XQueryFetcherTest);
