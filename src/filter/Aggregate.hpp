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

#ifndef AGGREGATE_HPP
#define AGGREGATE_HPP

#include <QObject>
#include <QJsonArray>

#include "Pipe.hpp"
#include "Item.hpp"

/*
 * TODO: add some maxItem property and emit itemOut whenever this property is reached
 */
class Aggregate : public Pipe
{
    Q_OBJECT
public:
    Q_INVOKABLE
    Aggregate(QObject *parent = 0);

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    inline const QJsonArray &items() const
    { return m_items; }

protected slots:
    void onPrevFinished(int status);

protected:
    QJsonArray m_items;
};

#endif // AGGREGATE_HPP
