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
** JSonUtils.cpp
**
**        Created on: 27 Dec 2015
**   Original Author: Sylvain Fargier <sylvain.fargier@somfy.com>
**
*/

#include <QJSValue>
#include <QJsonArray>
#include <QJsonObject>
#include <QJSValueIterator>

#include "JsonUtils.hpp"

QJsonValue toJsonValue(const QJSValue &jsValue)
{
    if (jsValue.isBool())
        return QJsonValue(jsValue.toBool());
    else if (jsValue.isString())
        return QJsonValue(jsValue.toString());
    else if (jsValue.isArray())
    {
        QJsonArray array;
        QJSValueIterator it(jsValue);
        while (it.next())
            array.append(toJsonValue(it.value()));
        return QJsonValue(array);
    }
    else if (jsValue.isNumber())
        return QJsonValue(jsValue.toNumber());
    else if (jsValue.isUndefined())
        return QJsonValue(QJsonValue::Undefined);
    else if (jsValue.isNull())
        return QJsonValue(QJsonValue::Null);
    else if (jsValue.isObject())
    {
        QJsonObject object;
        QJSValueIterator it(jsValue);
        while (it.next())
            object.insert(it.name(), toJsonValue(it.value()));
        return QJsonValue(object);
    }
    else
        return QJsonValue(jsValue.toString());
}

