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

#ifndef SIGNALWAITER_HPP
#define SIGNALWAITER_HPP

#include <QObject>
#include <QPointer>
#include <QMutex>
#include <QWaitCondition>

/**
 * @brief The SignalWaiter class waits for signals to occur
 */
class SignalWaiter : public QObject
{
    Q_OBJECT

public:
    SignalWaiter(QObject *obj, const char *sig);

    /**
     * @brief wait for the signal to be thrown
     * @param[in] timeout in msecs.
     * @return true if the signal was caught.
     */
    bool wait(unsigned long timeout);

    /**
     * @brief clear the signal counter
     */
    void reset();

protected Q_SLOTS:
    void wake();

protected:
    QPointer<QObject> m_obj;
    int m_count;
    QMutex m_lock;
    QWaitCondition m_cond;

    Q_DISABLE_COPY(SignalWaiter)
};

#endif // SIGNALWAITER_HPP
