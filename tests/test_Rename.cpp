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
 ** test_Rename.cpp
 **
 **        Created on: 22 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#include <QDebug>
#include <QTemporaryFile>
#include <QTextStream>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "Rename.hpp"
#include "StdioOut.hpp"
#include "ItemQueue.hpp"

#include "SignalWaiter.hpp"

#include "test_helpers.hpp"
#include "test_helpers_stddump.hpp"

using namespace testHelpers;

class RenameTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(RenameTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST(config);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        Rename ren;
        ItemQueue queue;
        ren.next(queue);

        Item item;
        item["var"] = "value";

        QJsonObject renames;
        renames["var"] = "newName";
        item["renames"] = renames;

        ren.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        item = queue.items().first();
        CPPUNIT_ASSERT(item.contains("newName"));
        CPPUNIT_ASSERT_EQUAL(QString("value"), item.value("newName").toString());
        CPPUNIT_ASSERT(!item.contains("renames"));
        CPPUNIT_ASSERT(!item.contains("var"));
    }

    void config()
    {
        Rename ren;
        ItemQueue queue;
        ren.next(queue);

        Item item;
        item["var"] = "value";

        QJsonObject config;
        QJsonObject renames;
        renames["var"] = "newName";
        config["renames"] = renames;
        item["RenameConfig"] = config;

        ren.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        item = queue.items().first();
        CPPUNIT_ASSERT(item.contains("newName"));
        CPPUNIT_ASSERT_EQUAL(QString("value"), item.value("newName").toString());
        CPPUNIT_ASSERT(!item.contains("RenameConfig"));
        CPPUNIT_ASSERT(!item.contains("var"));

        item = Item();
        item["var"] = "value"; /* check that configured renaming is permanent */
        ren.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(2, queue.items().size());

        item = queue.items().last();
        CPPUNIT_ASSERT(item.contains("newName"));
        CPPUNIT_ASSERT_EQUAL(QString("value"), item.value("newName").toString());
        CPPUNIT_ASSERT(!item.contains("var"));
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(RenameTest);
