/*
** This document and/or file is SOMFY's property. All information it
** contains is strictly confidential. This document and/or file shall
** not be used, reproduced or passed on in any way, in full or in part
** without SOMFY's prior written approval. All rights reserved.
** Ce document et/ou fichier est la propritye SOMFY. Les informations
** quil contient sont strictement confidentielles. Toute reproduction,
** utilisation, transmission de ce document et/ou fichier, partielle ou
** intégrale, non autorisée préalablement par SOMFY par écrit est
** interdite. Tous droits réservés.
**
** Copyright © (2009-2015), Somfy SAS. All rights reserved.
** All reproduction, use or distribution of this software, in whole or
** in part, by any means, without Somfy SAS prior written approval, is
** strictly forbidden.
**
** JSExpr.hpp
**
**        Created on: 26 Dec 2015
**   Original Author: Sylvain Fargier <sylvain.fargier@somfy.com>
**
*/

#ifndef JSEXPR_HPP
#define JSEXPR_HPP

#include <QObject>
#include <QJSEngine>

#include "Pipe.hpp"

class JSExpr : public Pipe
{
    Q_OBJECT
    Q_PROPERTY(bool evalOnly READ evalOnly WRITE setEvalOnly)
public:
    Q_INVOKABLE
    explicit JSExpr(QObject *parent = 0);

    bool itemIn(const Item &item);

    QString usage(const QString &usage);

    inline bool evalOnly() const
    { return m_evalOnly; }
    void setEvalOnly(bool value);

protected:
    bool m_evalOnly;
    QJSEngine m_engine;
};

#endif // JSEXPR_HPP
