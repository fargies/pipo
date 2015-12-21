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
 **        Created on: 12/12/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef ZALMOSFETCHER_HPP
#define ZALMOSFETCHER_HPP

#include <QObject>
#include <QNetworkAccessManager>
#include <QByteArray>
#include <QList>
#include <QNetworkCookie>
#include <QNetworkReply>

#include "HTMLFetcher.hpp"
#include "InputPipe.hpp"
#include "Item.hpp"

class ZalmosFetcher : public HTMLFetcher
{
    Q_OBJECT
public:
    Q_INVOKABLE
    ZalmosFetcher(QObject *parent = 0);

    Q_INVOKABLE
    ZalmosFetcher(const QString &url, QObject *parent = 0);

    bool itemIn(const Item &item);

    void start();

    QString usage(const QString &usage);

protected:
    QNetworkReply *fetchPage(const Item &item, const QList<QNetworkCookie> &cookies);

    bool processReply(QNetworkReply *reply);

protected slots:
    bool fetchCookiesReply();
};

#endif // ZALMOSFETCHER_HPP
