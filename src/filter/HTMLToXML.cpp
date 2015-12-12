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
 **        Created on: 12/4/2015
 **   Original Author: fargie_s
 **
 **/


#include <QDebug>

#include <tidy.h>
#include <buffio.h>

#include "HTMLToXML.hpp"

#include "HtmlTidy.hpp"

HTMLToXML::HTMLToXML(QObject *parent) :
    Pipe(parent),
    m_noNs(true)
{
}

bool HTMLToXML::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item newItem = setConfigProperties(item);
    if (newItem.isEmpty())
        return true;

    QString html = item.value("html").toString();
    if (html.isNull())
        emit itemOut(newItem);
    else
    {
        newItem.remove("html");

        html = HtmlTidy::tidyfy(html);

        if (m_noNs)
            removeNs(html);

        newItem.insert("xml", html);

        emit itemOut(newItem);
    }
}

QString HTMLToXML::usage(const QString &usage)
{
    return usage + "\n{ \"html\" : \"<htmldata>\" } -> HTMLToXML ->"
                   " { \"xml\" : \"<xmldata>\" }\n";
}

void HTMLToXML::setNoNamespaces(bool value)
{
    m_noNs = value;
}

void HTMLToXML::removeNs(QString &xml)
{
    if (m_nsReg.pattern().isEmpty())
        m_nsReg.setPattern("<[^\\s]+\\s+(?:[^\\s=>]+=\"[^\\\"]*\"\\s+)*[^\\s=>]+(:)");

    int offset = 0;
    for (QRegularExpressionMatch match = m_nsReg.match(xml);
         match.hasMatch();
         match = m_nsReg.match(xml, offset))
    {
        xml[match.capturedStart(1)] = '_';
        offset = match.capturedStart(0);
    }
}

PIPE_REGISTRATION(HTMLToXML)
