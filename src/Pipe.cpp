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

#include <QMetaObject>

#include "Pipe.hpp"
#include "ErrorItem.hpp"
#include "Item.hpp"

Pipe::Pipe(QObject *parent) : QObject(parent)
{

}

Pipe &Pipe::next(Pipe &pipe)
{
    connect(this, &Pipe::itemOut,
            &pipe, &Pipe::itemIn);
    connect(this, &Pipe::finished,
            &pipe, &Pipe::onPrevFinished);
    m_connCount++;
    return *this;
}

QString Pipe::usage(const QString &usage)
{
    emit itemOut(ErrorItem("No usage for: %1")
                 .arg(this->metaObject()->className()));
    return usage;
}

bool Pipe::itemIn(const Item &item)
{
    if (item.isErrorItem())
        emit itemOut(item);
    else if (item.contains("usage"))
        emit itemOut(Item::usageItem(usage(item.value("usage").toString())));
    else
        return false;
    return true;
}

void Pipe::onPrevFinished(int status)
{
    if (--m_connCount == 0)
        emit finished(status);
}