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

#include <QDebug>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "HTMLToXML.hpp"
#include "test_helpers.hpp"
#include "SignalWaiter.hpp"
#include "ItemQueue.hpp"

using namespace testHelpers;

class HTMLToXMLTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(HTMLToXMLTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(noNamespace);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        HTMLToXML conv;
        ItemQueue itemQueue;

        conv.next(itemQueue);

        Item item;
        item.insert("html", "<html><body><a href=\"pwet\"></a></body></html>");

        SignalWaiter waiter(&itemQueue, SIGNAL(itemOut(Item)));
        conv.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(1000));

        QList<Item> items = itemQueue.items();
        CPPUNIT_ASSERT_EQUAL(1, items.size());
        CPPUNIT_ASSERT(items.first().contains("xml"));
    }

    void noNamespace()
    {
        HTMLToXML conv;
        ItemQueue itemQueue;

        conv.next(itemQueue);

        SignalWaiter waiter(&itemQueue, SIGNAL(itemOut(Item)));
        Item item;
        item.insert("html",
                    "<html><body>"
                    "<a ugly:ns=\"42\" another:ns=\"33:33\">"
                    "</a>32:32</body></html>");

        conv.itemIn(item);

        CPPUNIT_ASSERT(waiter.wait(1000));

        QList<Item> items = itemQueue.items();
        CPPUNIT_ASSERT_EQUAL(1, items.size());

        QString xml = items.first().value("xml").toString();
        CPPUNIT_ASSERT(xml.contains("ugly_ns="));
        CPPUNIT_ASSERT(xml.contains("another_ns="));
        CPPUNIT_ASSERT(xml.contains("33:33"));
        CPPUNIT_ASSERT(xml.contains("32:32"));
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(HTMLToXMLTest);


