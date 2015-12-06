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

#ifndef HTMLToXML_HPP
#define HTMLToXML_HPP

#include <QObject>
#include <QRegularExpression>

#include "Pipe.hpp"

class HTMLToXML : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(bool noNamespaces READ noNamespaces WRITE setNoNamespaces)
public:
    Q_INVOKABLE
    HTMLToXML(QObject *parent = 0);

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    inline bool noNamespaces() const
    { return m_noNs; }
    void setNoNamespaces(bool value);

    static QString tidyfy(const QString &data);

protected:
    void removeNs(QString &xml);

protected:
    bool m_noNs;
    QRegularExpression m_nsReg;
};

#endif // HTMLTIDY_HPP
