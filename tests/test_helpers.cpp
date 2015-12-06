/*
** Copyright (C) 2014 Fargier Sylvain <fargier.sylvain@free.fr>
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
** test_helpers.cpp
**
**        Created on: Jan 31, 2013
**   Original Author: Fargier Sylvain <fargier.sylvain@free.fr>
**
*/

#include <QMutexLocker>
#include <QCoreApplication>
#include <QMetaEnum>
#include <QTimer>
#include <QDebug>

#include "test_helpers.hpp"

namespace testHelpers {

EventFilter::EventFilter(QObject *subject) :
    m_subject(subject)
{
    subject->installEventFilter(this);
}

EventFilter::~EventFilter()
{
    if (m_subject)
        m_subject->removeEventFilter(this);
}

bool EventFilter::eventFilter(QObject *object, QEvent *event)
{
    qDebug() << "[QEvent]:" << qPrintable(eventName(event->type())) << "->" << object;
    return false;
}

QString EventFilter::eventName(QEvent::Type type)
{
    static int idx = QEvent::staticMetaObject.indexOfEnumerator("Type");
    return QEvent::staticMetaObject.enumerator(idx).valueToKey((int) type);
}

}

