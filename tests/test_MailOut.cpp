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

#include <QDebug>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "MailOut.hpp"
#include "ItemQueue.hpp"
#include "SignalWaiter.hpp"
#include "StdioOut.hpp"

class MailOutTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(MailOutTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(async);
    CPPUNIT_TEST_SUITE_END();

protected:
    Item createMailItem()
    {
        Item item;
        item["from"] = "fargier.sylvain@free.fr";
        item["to"] = "fargier.sylvain@free.fr";
        item["subject"] = "testing pipo";
        item["content"] = "this is a test";
        item["outval"] = "a value to have an output item";
        return item;
    }

    void simple()
    {
        Item item = createMailItem();
        MailOut sendmail;
        ItemQueue queue;
        StdioOut stdioOut;
        sendmail.next(queue);
        queue.next(stdioOut);

        sendmail.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        item = queue.items().first();
        CPPUNIT_ASSERT(!item.isErrorItem());
        CPPUNIT_ASSERT(item.contains("outval"));
    }

    void async()
    {
        Item item = createMailItem();
        MailOut sendmail;
        ItemQueue queue;
        StdioOut stdioOut;

        sendmail.next(queue);
        queue.next(stdioOut);

        sendmail.setAsync(true);

        SignalWaiter waiter(&queue, SIGNAL(itemOut(Item)));
        sendmail.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(30000));
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        item = queue.items().first();
        CPPUNIT_ASSERT(!item.isErrorItem());
        CPPUNIT_ASSERT(item.contains("outval"));
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(MailOutTest);
