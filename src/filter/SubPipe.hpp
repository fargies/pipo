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
 ** SubPipe.hpp
 **
 **        Created on: 12/21/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef SUBPIPE_HPP
#define SUBPIPE_HPP

#include <QObject>

#include "InputPipe.hpp"

class SubPipe : public InputPipe
{
    Q_OBJECT
    Q_PROPERTY(QString subPipe READ subPipe WRITE setSubPipe)
public:
    Q_INVOKABLE
    SubPipe(QObject *parent = 0);

    inline const QString &subPipe() const
    { return m_subPipe; }
    bool setSubPipe(const QString &subPipe);
    void clearSubPipe();

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    Pipe &next(Pipe &pipe);

    void start();

    inline const QString &errorString() const
    { return m_errorString; }

protected slots:
    void onPrevFinished(int status);

protected:
    QString m_subPipe;
    QList<Pipe *> m_pipe;
    QString m_errorString;
};

#endif // SUBPIPE_HPP
