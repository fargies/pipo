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
 ** test_Match.cpp
 **
 **        Created on: 22 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#include <QDebug>
#include <QTemporaryFile>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "Match.hpp"
#include "StdioOut.hpp"
#include "ItemQueue.hpp"

#include "test_helpers_stddump.hpp"

class MatchTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(MatchTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        Match match;
        ItemQueue queue;
        match.next(queue);

        Item item;
        item["var"] = "value";

        QJsonObject config;
        config["matches"] = (Item() << Item::Value("var", "[a-z]al.*"));
        item["MatchConfig"] = config;

        match.itemIn(item);
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        match.itemIn(Item() << Item::Value("var", "vabue"));
        CPPUNIT_ASSERT_EQUAL(1, queue.items().size());

        match.itemIn(Item() << Item::Value("var", "zal"));
        CPPUNIT_ASSERT_EQUAL(2, queue.items().size());
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(MatchTest);

