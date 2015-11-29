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
 **        Created on: 11/23/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef STDIOIN_HPP
#define STDIOIN_HPP

#include <QObject>
#include <QSocketNotifier>
#include <QFile>

#include "DataIn.hpp"

class StdioIn : public DataIn
{
    Q_OBJECT
public:
    Q_INVOKABLE
    explicit StdioIn(QObject *parent = 0);

public slots:
    void start();

protected slots:
    void dataReady();

protected:
    QSocketNotifier *m_notifier;
    QFile m_in;
    QByteArray m_buff;
    int m_flags;
};

#endif // STDIOIN_HPP
