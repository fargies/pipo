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
 **        Created on: 12/6/2015
 **   Original Author: fargie_s
 **
 **/

#include <QJsonValue>
#include <QJsonArray>
#include <QFile>

#include "Mustache.hpp"
#include "mustache.h"
#include "ErrorItem.hpp"

Mustache::Mustache(QObject *parent) :
    Pipe(parent)
{
}

Mustache::Mustache(const QString &mstchFile, QObject *parent) :
    Pipe(parent),
    m_mstchFile(mstchFile)
{
}

bool Mustache::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item out(setConfigProperties(item));

    /* handle mustache variables */
    QJsonValue jsonVal(out.take("mustacheVars"));
    if (jsonVal.isArray())
    {
        QJsonArray mstchVars(jsonVal.toArray());

        for (QJsonArray::const_iterator it = mstchVars.constBegin();
             it != mstchVars.constEnd();
             ++it)
        {
            QString mstchVar(it->toString());
            out[mstchVar] = mustache(out.value(mstchVar).toString(), out);
        }
    }

    /* handle mustache file */
    QString mstchFile = out.take("mustacheFile").toString(m_mstchFile);
    QString tpl = out.take("mustacheTemplate").toString(m_mstchTemplate);
    if (!mstchFile.isEmpty())
    {
        QFile mstch(mstchFile);
        if (!mstch.open(QFile::ReadOnly))
            emit itemOut(ErrorItem(
                             "failed to open moustache template file %1: %2")
                         .arg(mstchFile).arg(mstch.errorString()));
        else
            mustacheOut(mstch.readAll(), out);
        mstch.close();
    }
    else if (!tpl.isEmpty())
        mustacheOut(tpl, out);

    if (!out.isEmpty())
        emit itemOut(out);
}

QString Mustache::usage(const QString &usage)
{
    return usage + "\n"
            "{\n"
            "  \"mustacheVars\" : [ \"var1\", \"var2\" ],\n"
            "  \"var1\" : \"{{value}}\", \"value\" : \"val\" }"
            " -> Mustache -> { \"var1\" : \"val\", \"value\", \"val\" }\n"

            "{ \"mustacheFile\" : \"<mustacheFile>\" } -> Mustache -> { \"mustacheOut\" : \"<result>\" }\n"

            "{ \"mustacheFile\" : \"<mustacheFile>\", \"mustacheOutFile\" : \"<outFile>\" } -> Mustache\n"
            "{ \"mustacheTemplate\" : \"<mustacheTemplate>\", \"mustacheOutFile\" : \"<outFile>\" } -> Mustache\n"

            "{ \"MustacheConfig\" : { \"mustacheFile\" : \"<tplFile>\", \"mustacheTemplate\" : \"tpl\", \"outFile\" : \"<outFile>\" }\n"
                   "\n";
}

void Mustache::setMustacheFile(const QString &fileName)
{
    m_mstchFile = fileName;
}

void Mustache::setOutFile(const QString &outFile)
{
    m_outFile = outFile;
}

void Mustache::setMustacheTemplate(const QString &tpl)
{
    m_mstchTemplate = tpl;
}

QString Mustache::mustache(const QString &tpl, const Item &context)
{
#if QT_VERSION >= 0x050500
    return Mstch::renderTemplate(tpl, context.toVariantHash());
#else
    return Mstch::renderTemplate(tpl, context.toVariantMap());
#endif
}

void Mustache::mustacheOut(const QString &tpl, Item &out)
{
    QString text = mustache(tpl, out);

    QString outFileName = out.take("mustacheOutFile").toString(m_outFile);
    if (outFileName.isEmpty())
        out.insert("mustacheOut", text);
    else
    {
        QFile outFile(outFileName);
        if (!outFile.open(QFile::WriteOnly))
            emit itemOut(ErrorItem(
                             "failed to open moustache output file %1: %2")
                         .arg(outFileName).arg(outFile.errorString()));
        else
        {
            outFile.write(text.toUtf8());
            outFile.close();
        }
    }
}

PIPE_REGISTRATION(Mustache)
