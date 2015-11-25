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
 ** HtmlTidy.cpp
 **
 **        Created on: 14/06/2015
 **   Original Author: fargie_s
 **
 **/

#include <QDebug>

#include <tidy.h>
#include <buffio.h>

#include "HtmlTidy.hpp"

HtmlTidy::HtmlTidy()
{
}

QString HtmlTidy::tidyfy(const QString &data)
{
    QString html_str;
    TidyDoc tdoc = tidyCreate();
    TidyBuffer output;
    TidyBuffer errbuf;
    int rc = -1;

    tidyBufInit(&output);
    tidyBufInit(&errbuf);
    rc = tidySetErrorBuffer(tdoc, &errbuf);
    if (rc >= 0)
      rc = tidyOptSetBool(tdoc, TidyXmlOut, yes);
    if (rc >= 0)
      rc = tidyOptSetBool(tdoc, TidyQuoteNbsp, no);
    if (rc >= 0)
      rc = tidySetInCharEncoding(tdoc, "utf8");
    if (rc >= 0)
      rc = tidySetOutCharEncoding(tdoc, "utf8");
    if ( rc >= 0 )
      rc = tidyParseString(tdoc, data.toUtf8().constData());
    if ( rc >= 0 )
      rc = tidyCleanAndRepair(tdoc);
    if ( rc >= 0 )
      rc = tidyRunDiagnostics(tdoc);
    if ( rc > 1 )
      rc = ( tidyOptSetBool(tdoc, TidyForceOutput, yes) ? rc : -1 );
    if ( rc >= 0 )
      rc = tidySaveBuffer(tdoc, &output);

    if (rc >= 0) {
      if (rc > 1) { /* 2 == error */
        qWarning() << "An error occured while running tidy: " << (const char *) errbuf.bp;
      }
      html_str = QString::fromUtf8((const char *) output.bp);
    }
    else {
      qWarning() << "A severe error occurred in tidy: " << rc;
    }

    tidyBufFree(&output);
    tidyBufFree(&errbuf);
    tidyRelease(tdoc);
    return (rc >= 0) ? html_str : QString();
}

