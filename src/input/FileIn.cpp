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
 **        Created on: 11/25/2015
 **   Original Author: fargie_s
 **
 **/

#include "FileIn.hpp"
#include "ErrorItem.hpp"

#define BUFF_SIZE 2048

FileIn::FileIn(const QString &fileName, QObject *parent) :
    DataIn(parent)
{
    m_in.setFileName(fileName);
}

QString FileIn::usage(const QString &usage)
{
    return usage + "\nFileIn(\"fileName\") -> { * }";
}


void FileIn::start()
{
    m_buff.reserve(BUFF_SIZE);

    if (!m_in.open(QIODevice::ReadOnly))
    {
        emit itemOut(ErrorItem(
                         QString("failed to open file %1: %2").arg(
                             m_in.fileName(), m_in.errorString())));
        emit finished(-1);
    }
    else
    {
        dataReady();
    }
}

void FileIn::dataReady()
{
    qint64 len = m_in.read(m_buff.data(), BUFF_SIZE);
    if (len > 0)
    {
        m_buff.resize(len);
        add(m_buff);
        QMetaObject::invokeMethod(this, "dataReady", Qt::QueuedConnection);
    }
    else
    {
        emit finished(0);
    }
}

PIPE_REGISTRATION(FileIn)
