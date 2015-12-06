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
 **        Created on: 12/5/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef HTMLFETCHER_HPP
#define HTMLFETCHER_HPP

#include <QObject>
#include <QNetworkAccessManager>
#include <QByteArray>

#include "InputPipe.hpp"
#include "Item.hpp"

class HTMLFetcher : public InputPipe
{
    Q_OBJECT
    Q_PROPERTY(bool async READ isAsync WRITE setAsync)
    Q_PROPERTY(QString url READ url WRITE setUrl)
public:
    Q_INVOKABLE
    HTMLFetcher(QObject *parent = 0);

    Q_INVOKABLE
    HTMLFetcher(const QString &url, QObject *parent = 0);

    QString usage(const QString &usage);

    bool itemIn(const Item &item);

    void start();

    inline const QString &url() const
    { return m_url; }
    void setUrl(const QString &url);

    inline bool isAsync() const
    { return m_async; }
    void setAsync(bool value);

protected slots:
    void onRequestFinished();
    void onPrevFinished(int status);

protected:
    void processReply(QNetworkReply *reply);
    void processData(const Item &item, const QByteArray &data);

protected:
    QString m_url;
    QNetworkAccessManager m_manager;
    int m_pendingCount;
    bool m_async;
};

#endif // HTMLFETCHER_HPP
