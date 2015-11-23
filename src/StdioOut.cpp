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

#include <QJsonDocument>

#include <unistd.h>

#include "StdioOut.hpp"
#include "ErrorItem.hpp"

StdioOut::StdioOut(bool indent, QObject *parent) :
    Pipe(parent),
    m_isIndent(indent)
{
}

void StdioOut::itemIn(const Item &item)
{
    const QByteArray msg(
                QJsonDocument(item).toJson(
                    m_isIndent ? QJsonDocument::Indented :
                                 QJsonDocument::Compact));

    if (ErrorItem::isErrorItem(item))
    {
        write(2, msg.constData(), msg.size());
        write(2, "\n", 1);
    }
    else
    {
        write(1, msg.constData(), msg.size());
        write(1, "\n", 1);
    }

    emit itemOut(item);
}
