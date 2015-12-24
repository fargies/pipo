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
#include <QCommandLineParser>

#include "StdioOut.hpp"
#include "StdioIn.hpp"
#include "PipeBuilder.hpp"
#include "SubPipe.hpp"
#include "ItemQueue.hpp"

#include "version.h"

int main(int argc, char *argv[])
{
    QCoreApplication app(argc, argv);
    app.setApplicationVersion(VERSION);
    app.setApplicationName("pipo");

    QCommandLineParser parser;
    parser.setApplicationDescription("Pipo data pipe tool");
    parser.addHelpOption();
    parser.addVersionOption();

    QCommandLineOption usage(QStringList() << "u" << "usage",
                             QCoreApplication::translate("args", "display pipe's usage"));
    parser.addOption(usage);
    parser.addPositionalArgument("pipe", QCoreApplication::translate("args", "pipe expression"), "StdioIn|SubPipe|StdioOut...");

    parser.process(app);

    SubPipe pipe;
    QString pipeExpr;
    if (parser.positionalArguments().isEmpty())
        pipeExpr = "StdioIn|SubPipe|StdioOut";
    else
        pipeExpr =parser.positionalArguments().first();
    if (!pipe.setSubPipe(pipeExpr))
    {
        qWarning() << qPrintable(pipe.errorString());
        return 1;
    }

    QObject::connect(&pipe, &Pipe::finished, &app, &QCoreApplication::quit, Qt::QueuedConnection);
    if (parser.isSet(usage))
    {
        ItemQueue queue;
        pipe.next(queue);
        pipe.itemIn(Item() << Item::Value("usage", ""));
        qWarning() << qPrintable(queue.items().first().value("usage").toString());
        emit pipe.finished(0);
    }
    else
        pipe.start();

    return app.exec();
}
