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
 **        Created on: 11/28/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "PipeBuilderParser.hpp"
#include "PipeBuilder.hpp"
#include "test_helpers.hpp"


class PipeBuilderParserTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(PipeBuilderParserTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        PipeBuilder builder;
        QStringList pipes;
        pipes << "StdioIn"
              << "StdioIn | StdioOut"
              << "StdioIn()|StdioOut()";

        foreach (const QString &pipeText, pipes)
        {
            InputPipe *in = builder.parsePipe(pipeText);
            CPPUNIT_ASSERT_MESSAGE(qPrintable(builder.errorString()), in);
            delete in;
        }
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(PipeBuilderParserTest);
