/*
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
 ** Rename.cpp
 **
 **        Created on: 22 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#include "Rename.hpp"

Rename::Rename(QObject *parent) :
    Pipe(parent)
{
}

bool Rename::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item out(setConfigProperties(item));
    {
        QJsonObject config = out.take("RenameConfig").toObject();
        if (config.contains("renames"))
            setRenames(config.value("renames").toObject());
    }

    QJsonObject renames = out.take("renames").toObject(m_renames);
    for (QJsonObject::const_iterator it = renames.constBegin();
         it != renames.constEnd();
         ++it)
    {
        QJsonValue val = out.take(it.key());
        if (!val.isUndefined())
            out.insert(it.value().toString(), val);
    }

    if (!out.isEmpty())
        emit itemOut(out);
}

QString Rename::usage(const QString &usage)
{
    return usage + "\n"
            "{ \"RenameConfig\" : { \"renames\" : { \"var\", \"newName\" } -> Rename\n"
            "{ \"var\" : * } -> Rename -> { \"newName\" : * }\n"
            "{ \"var\" : *, \"renames\" : { \"var\", \"newName\" } } -> Rename -> { \"newName\" : * }\n";
}

void Rename::setRenames(const QJsonObject &renames)
{
    m_renames = renames;
}

PIPE_REGISTRATION(Rename)
