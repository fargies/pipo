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

/**
 * @brief The core Pipe class
 */
class Pipe : public QObject
{
    Q_OBJECT
public:
    explicit Pipe(QObject *parent = 0);

    /**
     * @brief hook in next part of the PipeLine
     *
     * @param[in,out] pipe next pipe object
     * @return *this
     */
    virtual Pipe &next(Pipe &pipe);

    /**
     * @brief display pipe usage
     *
     * @param[in,out] usage usage request used as an output.
     *
     * @details
     * The "usage" field of Item will be filled with this Pipe's usage, if the
     * item was not empty data will be appended.
     */
    virtual QString usage(const QString &usage);

    /**
     * @brief set pipe config properties using Item
     * @param[in] item an item that might contain configuration
     * @return item with configuration parts removed
     */
    Item setConfigProperties(const Item &item);

    typedef QList<const QMetaObject *> Registry;
    static QList<const QMetaObject *> registry;

signals:
    /**
     * @brief signal emitted whenever an item has been processed by this Pipe
     * @param item the generated output
     */
    void itemOut(const Item &item);

    /**
     * @brief signal emitted whenever processing is totally finished on this Pipe
     * @param status the final status
     */
    void finished(int status);

protected slots:
    /**
     * @brief process an incoming item
     * @param[in] item incoming item to be processed
     * @return
     *  - true if the incoming item has been processed
     *  - false otherwise
     */
    virtual bool itemIn(const Item &item);

    /**
     * @brief parent pipe finished handler
     * @param[in] status parent pipe's status
     */
    virtual void onPrevFinished(int status);

protected:
    int m_connCount;

    friend class SubPipe;
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
    Pipe::registry.append(&tPipe::staticMetaObject);
}

/** @cond */
#define __TASK_JOIN_STR1(s1, s2) s1##s2
#define __TASK_JOIN_STR(s1, s2) __TASK_JOIN_STR1(s1, s2)
/** @endcond */
#define PIPE_REGISTRATION(tPipe) \
    static PipeRegistration<tPipe> __TASK_JOIN_STR(s_reg, __LINE__);

#endif // PIPE_HPP
