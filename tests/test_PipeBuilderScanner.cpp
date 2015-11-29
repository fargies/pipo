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
 ** test_SharedObject.cpp
 **
 **        Created on: 26/07/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>

#include <cppunit/TestFixture.h>
#include <cppunit/extensions/HelperMacros.h>

#include "PipeBuilderParser.hpp"
#include "PipeBuilderScanner.hpp"
#include "test_helpers.hpp"


class PipeBuilderScannerTest : public CppUnit::TestFixture
{
    CPPUNIT_TEST_SUITE(PipeBuilderScannerTest);
    CPPUNIT_TEST(simple);
    CPPUNIT_TEST_SUITE_END();

protected:
    void simple()
    {
        struct {
            const QLatin1String text;
            const QList<int> values;
        } data[] = {
            { QLatin1String("pipe \"42\" \'44\'"),
              QList<int>() << STRING << QUOTED << QUOTED },
            { QLatin1String("\'quoted with space \" \" \'"),
              QList<int>() << QUOTED },
            { QLatin1String("\"quoted with space \\\'' \\\" \""),
              QList<int>() << QUOTED },
            { QLatin1String("\"quoted\\\\\""),
              QList<int>() << QUOTED },
        };
        yyscan_t scanner;
        YYSTYPE stype;
        yylex_init(&scanner);
        CPPUNIT_ASSERT(scanner);


        for (int i = 0; i < (sizeof (data) / sizeof (data[0])); ++i)
        {
            yy_scan_string(data[i].text.data(), scanner);

            for (int j = 0; j < data[i].values.size(); ++j)
            {
                int tok = yylex(&stype, scanner);
                if (tok == STRING || tok == QUOTED)
                    free(stype.sval);
                CPPUNIT_ASSERT_EQUAL(data[i].values.at(j), tok);
            }
            CPPUNIT_ASSERT_EQUAL(0, yylex(&stype, scanner));
            yypop_buffer_state(scanner);
        }
        CPPUNIT_ASSERT(yylex_destroy(scanner) == 0);
    }
};

CPPUNIT_TEST_SUITE_REGISTRATION(PipeBuilderScannerTest);
