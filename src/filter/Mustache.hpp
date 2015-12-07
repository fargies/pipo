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
 **        Created on: 12/6/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef MUSTACHE_HPP
#define MUSTACHE_HPP

#include <QObject>
#include <QString>

#include "Pipe.hpp"

class Mustache : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(QString mustacheFile READ mustacheFile WRITE setMustacheFile)
    Q_PROPERTY(QString mustacheTemplate READ mustacheTemplate WRITE setMustacheTemplate)
    Q_PROPERTY(QString outFile READ outFile WRITE setOutFile)
public:
    Q_INVOKABLE
    Mustache(QObject *parent = 0);

    Q_INVOKABLE
    Mustache(const QString &mustacheFile, QObject *parent = 0);

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    inline QString mustacheFile() const
    { return m_mstchFile; }
    void setMustacheFile(const QString &fileName);

    inline QString outFile() const
    { return m_outFile; }
    void setOutFile(const QString &outFile);

    inline QString mustacheTemplate() const
    { return m_mstchTemplate; }
    void setMustacheTemplate(const QString &tpl);

    QString mustache(const QString &tpl, const Item &context);

protected:
    void mustacheOut(const QString &tpl, Item &out);

protected:
    QString m_mstchFile;
    QString m_outFile;
    QString m_mstchTemplate;
};

#endif // MUSTACHE_HPP
