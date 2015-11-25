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

#include <QJsonDocument>
#include <QJsonParseError>

#include "DataIn.hpp"
#include "ErrorItem.hpp"

DataIn::DataIn(QObject *parent) :
    InputPipe(parent)
{
    m_buffer.reserve(4096);
}

void DataIn::add(const QByteArray &data)
{
    m_buffer.append(data);

    while (!m_buffer.isEmpty())
    {
        int end = findJsonObjectEnd(m_buffer);
        if (end == -1)
            return;

        QJsonParseError error;
        QJsonDocument doc = QJsonDocument::fromJson(m_buffer.mid(0, end + 1), &error);
        m_buffer = m_buffer.mid(end + 1);
        if (doc.isEmpty()) {
            if (error.error != QJsonParseError::NoError)
                emit itemOut(ErrorItem(error.errorString()));
        }
        else if (!doc.isObject())
            emit itemOut(ErrorItem("not a json Object"));
        else
            emit itemOut(Item(doc.object()));
    }
}

int DataIn::findJsonObjectEnd(const QByteArray &jsonData)
{
    const char* pos = jsonData.constData();
    const char* end = pos + jsonData.length();

    char blockStart = 0;
    char blockEnd = 0;
    int index = 0;

    // Find the beginning of the JSON document and determine if it is an object or an array
    while (true) {
        if (pos == end) {
            return -1;
        } else if (*pos == '{') {
            blockStart = '{';
            blockEnd = '}';
            break;
        } else if(*pos == '[') {
            blockStart = '[';
            blockEnd = ']';
            break;
        }

        pos++;
        index++;
    }

    // Find the end of the JSON document
    pos++;
    index++;
    int depth = 1;
    bool inString = false;
    while (depth > 0 && pos <= end) {
        if (*pos == '\\') {
            pos += 2;
            index += 2;
            continue;
        } else if (*pos == '"') {
            inString = !inString;
        } else if (!inString) {
            if (*pos == blockStart)
                depth++;
            else if (*pos == blockEnd)
                depth--;
        }

        pos++;
        index++;
    }

    // index-1 because we are one position ahead
    return depth == 0 ? index-1 : -1;
}

