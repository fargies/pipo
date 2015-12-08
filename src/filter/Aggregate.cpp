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
 **        Created on: 12/7/2015
 **   Original Author: fargie_s
 **
 **/

#include "Aggregate.hpp"


Aggregate::Aggregate(QObject *parent) :
    Pipe(parent)
{
}

bool Aggregate::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;
    else
    {
        Item kept(item);
        Item out;

        for (QJsonObject::const_iterator it = item.constBegin();
             it != item.constEnd();
             ++it)
        {
            const QString &key(it.key());
            if (key.endsWith("Config"))
                out.insert(key, kept.take(key));
        }
        if (!kept.isEmpty())
            m_items.append(kept);
        if (!out.isEmpty())
            emit itemOut(out);
    }
}

QString Aggregate::usage(const QString &usage)
{
    return usage + "\n"
            "{ * } -> Aggregate\n"
            "eof -> Aggregate -> { \"items\" : [ { * }, { * } ] }\n"
            "{ \"MyConfig\" : { * } } -> Aggregate -> { \"MyConfig\" : { * } }\n";
}

void Aggregate::onPrevFinished(int status)
{
    if ((m_connCount == 1) && !m_items.isEmpty())
    {
        Item out;
        out.insert("items", m_items);
        m_items = QJsonArray();
        emit itemOut(out);
    }
    Pipe::onPrevFinished(status);
}

PIPE_REGISTRATION(Aggregate)
