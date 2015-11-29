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
 **        Created on: 11/22/2015
 **   Original Author: fargie_s
 **
 **/

#include <QCoreApplication>
#include <QMetaType>
#include <QDebug>

#include "EodDataStockExFetcher.hpp"
#include "StdioOut.hpp"
#include "StdioIn.hpp"
#include "PipeBuilder.hpp"

int main(int argc, char *argv[])
{
    QCoreApplication app(argc, argv);

    if (app.arguments().size() <= 1)
    {
        qWarning() << "[usage]:"
                      << qPrintable(app.arguments().at(0)) << "\"pipe\"";
        return 1;
    }

    PipeBuilder builder;
    InputPipe *in = builder.parsePipe(app.arguments().at(1));
    if (!in)
    {
        qWarning() << qPrintable(builder.errorString());
        return 1;
    }
    in->start();
    QObject::connect(in, SIGNAL(finished(int)),
                     &app, SLOT(quit()));

    return app.exec();
}
