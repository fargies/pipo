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
 **        Created on: 12/6/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>
#include <QJsonArray>
#include <QTemporaryFile>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "Mustache.hpp"
#include "ItemQueue.hpp"
#include "SignalWaiter.hpp"

#include "test_helpers.hpp"
#include "test_helpers_stddump.hpp"


class MustacheTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(MustacheTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(mustacheFile);
    CPPUNIT_TEST(mustacheTemplate);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        Mustache m;
        ItemQueue queue;
        m.next(queue);

        Item item;
        item.insert("var1", "{{value}}");
        item.insert("var2", "{{value}} {{value}}");
        item.insert("value", "42");

        QJsonArray mustacheVars;
        mustacheVars.append("var1");
        mustacheVars.append("var2");
        item.insert("mustacheVars", mustacheVars);

        SignalWaiter waiter(&m, SIGNAL(itemOut(Item)));
        m.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(1000));
        CPPUNIT_ASSERT(!queue.items().isEmpty());

        item = queue.items().first();
        CPPUNIT_ASSERT_EQUAL(QString("42"), item.value("var1").toString());
        CPPUNIT_ASSERT_EQUAL(QString("42 42"), item.value("var2").toString());
        CPPUNIT_ASSERT(!item.contains("mustacheVars"));
    }

    void mustacheFile()
    {
        Mustache m;
        ItemQueue queue;
        m.next(queue);

        Item item;
        item.insert("value", "42");

        QJsonArray table;
        table.append("1");
        table.append("2");
        item.insert("table", table);

        QTemporaryFile mstchFile;
        CPPUNIT_ASSERT(mstchFile.open());

        mstchFile.write("This is value: {{value}}\n");
        mstchFile.write("{{#table}}Here is an element: {{.}}\n{{/table}}");
        mstchFile.flush();

        item.insert("mustacheFile", mstchFile.fileName());

        SignalWaiter waiter(&m, SIGNAL(itemOut(Item)));
        m.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(1000));
        CPPUNIT_ASSERT(!queue.items().isEmpty());

        item = queue.items().first();
        QString result = item.value("mustacheOut").toString();
        CPPUNIT_ASSERT(result.contains("This is value: 42\n"));
        CPPUNIT_ASSERT(result.contains("Here is an element: 1\n"));
        CPPUNIT_ASSERT(result.contains("Here is an element: 2\n"));
        CPPUNIT_ASSERT(!item.contains("mustacheFile"));
    }

    void mustacheTemplate()
    {
        Mustache m;
        ItemQueue queue;
        m.next(queue);

        Item item;
        item.insert("value", "42");

        QJsonArray table;
        table.append("1");
        table.append("2");
        item.insert("table", table);

        QTemporaryFile mstchOutFile;
        CPPUNIT_ASSERT(mstchOutFile.open());

        item.insert("mustacheTemplate", "This is value: {{value}}\n");
        item.insert("mustacheOutFile", mstchOutFile.fileName());

        m.itemIn(item);

        mstchOutFile.seek(0);
        QString result = mstchOutFile.readAll();
        CPPUNIT_ASSERT(result.contains("This is value: 42\n"));
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(MustacheTest);
