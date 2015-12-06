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
 **        Created on: 12/1/2015
 **   Original Author: fargie_s
 **
 **/

#include <QTimer>
#include <QCoreApplication>
#include <QEventLoop>

#include "SignalWaiter.hpp"

SignalWaiter::SignalWaiter(
        QObject *obj,
        const char *sig) :
    m_obj(obj),
    m_count(0)
{
    connect(obj, sig,
            this, SLOT(wake()));
}

bool SignalWaiter::wait(unsigned long timeout)
{
    QMutexLocker l(&m_lock);

    if (m_count > 0)
        return true;
    else if (!m_obj)
    {
        qWarning("[SignalWaiter]: object has already been destroyed");
        return false;
    }
    else if (m_obj->thread() == thread())
    {
        QTimer t;
        t.setSingleShot(true);
        t.start(timeout);

        while ((m_count == 0) && t.isActive())
        {
            l.unlock();
            QCoreApplication::processEvents(QEventLoop::AllEvents |
                    QEventLoop::WaitForMoreEvents, 100);
            QCoreApplication::sendPostedEvents(0, QEvent::DeferredDelete);
            l.relock();
        }
    }
    else
        m_cond.wait(&m_lock, timeout);
    return m_count > 0;
}

void SignalWaiter::wake()
{
    QMutexLocker l(&m_lock);
    ++m_count;
    m_cond.wakeAll();
}

void SignalWaiter::reset()
{
    m_count = 0;
}
