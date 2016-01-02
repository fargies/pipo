/*
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
 ** test_JSExpr.cpp
 **
 **        Created on: 27 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#include <QDebug>
#include <QTemporaryFile>
#include <QTextStream>
#include <QJsonArray>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "Mustache.hpp"
#include "JSExpr.hpp"
#include "StdioOut.hpp"
#include "ItemQueue.hpp"

#include "SignalWaiter.hpp"

#include "test_helpers.hpp"
#include "test_helpers_stddump.hpp"

using namespace testHelpers;

class JSExprTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(JSExprTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(syntaxError);
    CPPUNIT_TEST(value);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        Mustache mustache;
        JSExpr expr;
        ItemQueue queue;
        mustache.next(expr)
                .next(queue);

        Item item;
        item["value"] = 10;
        item["jsExpr"] = "{{value}} >= 10";
        item["mustacheVars"] = (QJsonArray() << "jsExpr");

        mustache.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        item = queue.items().first();
        CPPUNIT_ASSERT_EQUAL(10, item.value("value").toInt());
        CPPUNIT_ASSERT(!item.contains("jsExpr"));
    }

    void syntaxError()
    {
        QList<QJsonValue> tests;
        tests.append("1/*2");
        /* QJsonObject */
        tests.append(Item() << Item::Value("this", 2));        Item item;

        foreach (QJsonValue val, tests)
        {
            JSExpr expr;
            ItemQueue queue;
            expr.next(queue);

            Item item;
            item << Item::Value("jsExpr", val)
                 << Item::Value("outVal", 1);

            expr.itemIn(item);
            CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

            item = queue.items().first();
            CPPUNIT_ASSERT_MESSAGE(
                        qPrintable(QString("failed for: %1").arg(val.toString())),
                        item.isErrorItem());
        }
    }

    void value()
    {
        QList<QPair<QString, QJsonValue> > tests;
        tests.append(QPair<QString, QJsonValue>("1 + 1", QJsonValue(2)));
        tests.append(QPair<QString, QJsonValue>("1 + 1 == 2", QJsonValue(true)));
        tests.append(QPair<QString, QJsonValue>("\"this is a string\"", QJsonValue("this is a string")));

        for (int i = 0; i < tests.size(); ++i)
        {
            JSExpr expr;
            ItemQueue queue;
            expr.next(queue);

            Item item;
            item << Item::Value("jsExpr", tests.at(i).first)
                 << Item::Value("JSExprConfig", (Item() << Item::Value("evalOnly", true)));

            expr.itemIn(item);
            CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

            item = queue.items().first();
            CPPUNIT_ASSERT_EQUAL_MESSAGE(
                        qPrintable(QString("failed for: %1").arg(tests.at(i).first)),
                        tests.at(i).second.type(), item.value("jsExpr").type());
            CPPUNIT_ASSERT_MESSAGE(
                        qPrintable(QString("failed for: %1").arg(tests.at(i).first)),
                        item.value("jsExpr") == tests.at(i).second);
        }
    }

};

CPPUNIT_TEST_SUITE_REGISTRATION(JSExprTest);
