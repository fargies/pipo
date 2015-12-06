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
 **        Created on: 11/30/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "ProxyTester.hpp"
#include "StdioOut.hpp"
#include "test_helpers.hpp"
#include "SignalWaiter.hpp"

using namespace testHelpers;

class ProxyTesterTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(ProxyTesterTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        ProxyTester tester;
        StdioOut out;
        tester.next(out);//"203.81.67.86"

        Item item;
        item.insert("hostName", "89.235.174.160");//209.124.106.140");
        item.insert("port", 8080);//3128); // https ?

        SignalWaiter waiter(&tester, SIGNAL(itemOut(Item)));
        tester.itemIn(item);
        CPPUNIT_ASSERT(waiter.wait(35000));
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(ProxyTesterTest);

