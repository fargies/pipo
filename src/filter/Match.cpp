/*
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
 ** Rename.hpp
 **
 ** Match.cpp
 **
 **        Created on: 22 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#include <QJsonObject>

#include "Match.hpp"
#include "ErrorItem.hpp"

Match::Match(QObject *parent) :
    Pipe(parent),
    m_filterUndefined(false)
{
}

bool Match::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item out(setConfigProperties(item));
    {
        QJsonObject config = out.take("MatchConfig").toObject();
        if (config.contains("matches"))
        {
            if (!setMatches(config.value("matches").toObject()))
                emit itemOut(ErrorItem(m_errorString)); /* keep going */
        }
    }

    if (out.isEmpty())
        return true;
    for (Matches::const_iterator it = m_matches.constBegin();
         it != m_matches.constEnd();
         ++it)
    {
        QJsonValue value = out.value(it.key());
        if (value.isUndefined()) /* does not exist on this object */
        {
            if (m_filterUndefined)
                return true;
        }
        else if (!it.value().match(value.toString()).hasMatch())
                return true;
    }
    emit itemOut(out);
    return true;
}

QString Match::usage(const QString &usage)
{
    return usage + "\n{ \"MatchConfig\" : { \"matches\" : { \"var\" : \"[to]*\" } } } -> Match\n"
                   "\n{ \"var\" : \"toto\" } -> Match -> { \"var\" : \"toto\" }\n";
}

QJsonObject Match::matches() const
{
   QJsonObject out;

   for (Matches::const_iterator it = m_matches.constBegin();
        it != m_matches.constEnd();
        ++it)
   {
       out.insert(it.key(), it.value().pattern());
   }
   return out;
}

bool Match::setMatches(const QJsonObject &matches)
{
    Matches newMatch;

    for (QJsonObject::const_iterator it = matches.constBegin();
         it != matches.constEnd();
         ++it)
    {
        QRegularExpression exp(it.value().toString(),
                               QRegularExpression::DontCaptureOption);
        if (!exp.isValid())
        {
            m_errorString = QString("invalid regex for %1: %2")
                    .arg(it.key(), exp.errorString());
            return false;
        }
        exp.optimize();
        newMatch.insert(it.key(), exp);
    }

    m_matches = newMatch;
    return true;
}

void Match::setFilterUndefined(bool value)
{
    m_filterUndefined = value;
}

PIPE_REGISTRATION(Match)

