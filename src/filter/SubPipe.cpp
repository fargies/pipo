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
 ** SubPipe.cpp
 **
 **        Created on: 12/21/2015
 **   Original Author: fargie_s
 **
 **/

#include "SubPipe.hpp"
#include "PipeBuilder.hpp"
#include "ErrorItem.hpp"

SubPipe::SubPipe(QObject *parent) :
    InputPipe(parent)
{
}

bool SubPipe::setSubPipe(const QString &subPipe)
{
    if (subPipe != m_subPipe)
    {
        clearSubPipe();
        if (subPipe.isEmpty())
            return true;

        /* connect last to finished signal */
        PipeBuilder builder;

        m_pipe = builder.parsePipe(subPipe);
        m_errorString = builder.errorString();

        if (!m_pipe.isEmpty())
        {
            connect(m_pipe.last(), &Pipe::finished,
                    this, &Pipe::finished);
            connect(m_pipe.last(), &Pipe::itemOut,
                    this, &Pipe::itemOut);
            m_pipe.first()->m_connCount = m_connCount;
            m_subPipe = subPipe;
        }
    return !m_pipe.isEmpty();
    }
    else
        return true;
}

void SubPipe::clearSubPipe()
{
    if (!m_pipe.isEmpty())
    {
        m_subPipe.clear();
        m_pipe.last()->disconnect(this);
        foreach (Pipe *p, m_pipe)
            p->deleteLater();
    }
}

bool SubPipe::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item outItem = setConfigProperties(item);
    QString pipe = outItem.take("pipe").toString();
    if (!pipe.isNull()) /* empty pipe is still a correct value */
    {
        if (!setSubPipe(pipe))
            emit itemOut(ErrorItem("failed to create pipe: %1")
                         .arg(m_errorString));
    }

    if (outItem.isEmpty())
        return true;

    if (m_pipe.isEmpty())
        emit itemOut(outItem);
    else
        m_pipe.first()->itemIn(outItem);
    return true;
}

QString SubPipe::usage(const QString &usage)
{
    return usage + "\n{ * } -> SubPipe -> { * }\n"
                   "{ \"pipe\" : \"pipe|pipe\" } -> SubPipe\n"
                   "{ \"SubPipeConfig\" : { \"subPipe\" : \"pipe|pipe\" } }\n";
}

Pipe &SubPipe::next(Pipe &pipe)
{
    if (!m_pipe.isEmpty())
        m_pipe.first()->m_connCount++;
    return Pipe::next(pipe);
}

void SubPipe::start()
{
    if (m_pipe.isEmpty())
        return;

    InputPipe *pipe = qobject_cast<InputPipe *>(m_pipe.first());
    if (pipe)
        pipe->start();
}

void SubPipe::onPrevFinished(int status)
{
    if (!m_pipe.isEmpty())
    {
        --m_connCount;
        m_pipe.first()->onPrevFinished(status);
    }
    else if (--m_connCount == 0)
        emit finished(status);
}

PIPE_REGISTRATION(SubPipe)
