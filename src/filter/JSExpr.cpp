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
** JSExpr.cpp
**
**        Created on: 26 Dec 2015
**   Original Author: Sylvain Fargier <sylvain.fargier@somfy.com>
**
*/

#include <QJSEngine>
#include <QDebug>

#include "JSExpr.hpp"
#include "ErrorItem.hpp"
#include "JsonUtils.hpp"

JSExpr::JSExpr(QObject *parent) :
    Pipe(parent),
    m_evalOnly(false)
{
}

bool JSExpr::itemIn(const Item &item)
{
    if (Pipe::itemIn(item))
        return true;

    Item out(setConfigProperties(item));

    if (out.isEmpty())
        return true;
    QJsonValue jsExpr = out.take("jsExpr");
    if (jsExpr.isString())
    {
        QJSValue ret = m_engine.evaluate(jsExpr.toString());
        if (ret.isError())
            out = ErrorItem("JSExpr: %1").arg(ret.toString());
        else if (m_evalOnly) /* FIXME: convert to QJsonValue */
            out.insert("jsExpr", toJsonValue(ret));
        else if (!ret.toBool())
            out = Item();
    }
    else if (!jsExpr.isUndefined())
        out = ErrorItem("JSExpr: expr must be a string");
    if (!out.isEmpty())
        emit itemOut(out);
    return true;
}

QString JSExpr::usage(const QString &usage)
{
   return usage + "\n"
                  "{ \"jsExpr\" : \"1 + 1\" } -> JSExpr -> { }\n";
}

void JSExpr::setEvalOnly(bool value)
{
    m_evalOnly = value;
}

