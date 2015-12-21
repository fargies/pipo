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
 **        Created on: 12/8/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>
#include <QTemporaryFile>
#include <QTextStream>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "test_helpers_stddump.hpp"

#include "Aggregate.hpp"
#include "ManualIn.hpp"
#include "ItemQueue.hpp"
#include "ErrorItem.hpp"

class AggregateTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(AggregateTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(config);
    CPPUNIT_TEST(errors);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        Aggregate aggreg;
        ManualIn in;
        ItemQueue out;
        in
        .next(aggreg)
        .next(out);

        in.start();
        for (int i = 0; i < 10; ++i)
        {
            Item item;
            item.insert("var", QString("value %1").arg(QString::number(i)));
            in.itemIn(item);
        }

        CPPUNIT_ASSERT_EQUAL(10, aggreg.items().size());
        CPPUNIT_ASSERT_EQUAL(0,  out.items().size());

        in.end();
        CPPUNIT_ASSERT_EQUAL(0, aggreg.items().size());
        CPPUNIT_ASSERT_EQUAL(1,  out.items().size());

        Item item = out.items().first();
        CPPUNIT_ASSERT(item.contains("items"));
        QJsonValue itemsValue = item.value("items");
        CPPUNIT_ASSERT(itemsValue.isArray());
        QJsonArray itemsArray = itemsValue.toArray();
        CPPUNIT_ASSERT_EQUAL(10, itemsArray.size());

        for (int i = 0; i < 10; ++i)
        {
            Item arrayItem(itemsArray.at(i).toObject());
            CPPUNIT_ASSERT_EQUAL(QString("value %1").arg(QString::number(i)),
                                 arrayItem.value("var").toString());
        }
    }

    void config()
    {
        Aggregate aggreg;
        ManualIn in;
        in.next(aggreg);

        in.start();

        Item item;
        QJsonObject config;
        config.insert("configVar", "value");
        item.insert("ItemConfig", config);
        in.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(0, aggreg.items().size()); /* filtered out */

        item.insert("var", "value");
        in.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(1, aggreg.items().size());

        QJsonObject obj = aggreg.items().first().toObject();
        CPPUNIT_ASSERT(obj.contains("var"));
        CPPUNIT_ASSERT(!obj.contains("ItemConfig")); /* filtered out */

        in.end();
    }

    void errors()
    {
        Aggregate aggreg;
        ManualIn in;
        ItemQueue out;
        in.next(aggreg);
        aggreg.next(out);

        in.start();
        ErrorItem error("error item");

        in.itemIn(error);
        CPPUNIT_ASSERT_EQUAL(0, aggreg.items().size()); /* filtered out */
        CPPUNIT_ASSERT_EQUAL(1, out.items().size());

        in.end();
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(AggregateTest);
