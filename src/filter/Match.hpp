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
 **
 ** Match.hpp
 **
 **        Created on: 22 Dec 2015
 **   Original Author: Sylvain Fargier <fargier.sylvain@free.fr>
 **
 */

#ifndef MATCH_HPP
#define MATCH_HPP

#include <QObject>
#include <QJsonObject>
#include <QHash>
#include <QRegularExpression>

#include "Pipe.hpp"

class Match : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(QJsonObject matches READ matches WRITE setMatches)
    Q_PROPERTY(bool filterUndefined READ filterUndefined WRITE setFilterUndefined)
public:
    Q_INVOKABLE
    explicit Match(QObject *parent = 0);

    typedef QHash<QString, QRegularExpression> Matches;

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    QJsonObject matches() const;
    bool setMatches(const QJsonObject &matches);

    inline bool filterUndefined() const
    { return m_filterUndefined; }
    void setFilterUndefined(bool value);

    inline QString errorString() const
    { return m_errorString; }

protected:
    QHash<QString, QRegularExpression> m_matches;
    bool m_filterUndefined;
    QString m_errorString;
};

#endif // MATCH_HPP
