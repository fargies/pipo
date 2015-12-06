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

#include <QDebug>
#include <fcntl.h>
#include <unistd.h>

#include "StdioIn.hpp"

#define BUFF_SIZE 2048

StdioIn::StdioIn(QObject *parent) :
    DataIn(parent)
{
}

QString StdioIn::usage(const QString &usage)
{
    return usage + "\nStdioIn -> { * }\n";
}

void StdioIn::start()
{
    m_buff.reserve(BUFF_SIZE);

    m_flags = fcntl(0, F_GETFL, 0);
    fcntl(0, F_SETFL, m_flags | O_NONBLOCK);

    m_in.open(0, QIODevice::ReadOnly | QIODevice::Text
              | QIODevice::Unbuffered, QFile::DontCloseHandle);
    m_notifier = new QSocketNotifier(0,
                                     QSocketNotifier::Read,
                                     this);
    connect(m_notifier, &QSocketNotifier::activated,
            this, &StdioIn::dataReady, Qt::QueuedConnection);
    m_notifier->setEnabled(true);

}

void StdioIn::dataReady()
{
    if (!m_notifier)
        return;

    m_notifier->setEnabled(false);
    qint64 len = m_in.read(m_buff.data(), BUFF_SIZE);
    if (len > 0)
    {
        m_buff.resize(len);
        add(m_buff);
        m_notifier->setEnabled(true);
    }
    else
    {
        disconnect(m_notifier, &QSocketNotifier::activated,
                   this, &StdioIn::dataReady);
        disconnect(&m_in, &QFile::readChannelFinished,
                   this, &StdioIn::dataReady);
        delete m_notifier;
        m_notifier = 0;
        fcntl(0, F_SETFL, m_flags);
        emit finished(0);
    }
}

PIPE_REGISTRATION(StdioIn)
