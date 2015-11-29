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

#ifndef PIPE_HPP
#define PIPE_HPP

#include <QObject>
#include <QMetaType>

#include "Item.hpp"

class Pipe : public QObject
{
    Q_OBJECT
public:
    explicit Pipe(QObject *parent = 0);

    Pipe &next(Pipe &pipe);

signals:
    void itemOut(const Item &item);
    void finished(int status);

protected slots:
    virtual void itemIn(const Item &item);
    virtual void onPrevFinished(int status);

protected:
    int m_connCount;
};

template <typename tPipe>
class PipeRegistration
{
public:
    PipeRegistration();
};

template <typename tPipe>
PipeRegistration<tPipe>::PipeRegistration()
{
    qRegisterMetaType<tPipe*>();
}

/** @cond */
#define __TASK_JOIN_STR1(s1, s2) s1##s2
#define __TASK_JOIN_STR(s1, s2) __TASK_JOIN_STR1(s1, s2)
/** @endcond */
#define PIPE_REGISTRATION(tPipe) \
    static PipeRegistration<tPipe> __TASK_JOIN_STR(s_reg, __LINE__);

#endif // PIPE_HPP
