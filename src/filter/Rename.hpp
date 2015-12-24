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
 ** Rename.hpp
 **
 **        Created on: 22 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#ifndef RENAME_HPP
#define RENAME_HPP

#include <QObject>
#include <QHash>
#include <QString>

#include "Pipe.hpp"

class Rename : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(QJsonObject renames READ renames WRITE setRenames)
public:
    Q_INVOKABLE
    explicit Rename(QObject *parent = 0);

    typedef QJsonObject NamesMap;

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    inline const QJsonObject &renames() const
    { return m_renames; }
    void setRenames(const QJsonObject &renames);

protected:
    QJsonObject m_renames;
};

#endif // RENAME_HPP
