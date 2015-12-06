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

#include <QStringListModel>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QXmlQuery>
#include <QXmlResultItems>
#include <QDebug>

#include "EodDataStockExFetcher.hpp"
#include "HtmlTidy.hpp"
#include "ErrorItem.hpp"

EodDataStockExFetcher::EodDataStockExFetcher(QObject *parent) :
    InputPipe(parent),
    m_eodDataUrl("http://www.eoddata.com/")
{

}

void EodDataStockExFetcher::setUrl(const QString &url)
{
    m_eodDataUrl = url;
}

bool EodDataStockExFetcher::processData(const QByteArray &data)
{
    QString html = HtmlTidy::tidyfy(QString(data));
    if (html.isEmpty())
    {
        emit itemOut(ErrorItem("failed to parse html content"));
        return false;
    }
    QXmlNamePool namePool;
    QXmlQuery query(namePool);
    QXmlResultItems result;

    query.setFocus(html);
    query.setQuery("//*:select[contains(@id,'cboExchange')]/*:option[@value]");
    query.evaluateTo(&result);

    if (!query.isValid() || result.hasError()) {
        emit itemOut(ErrorItem(QString("Failed to extract data from %1").arg(m_eodDataUrl)));
        return false;
    }

    for (QXmlItem item = result.next(); !item.isNull(); item = result.next())
    {
        QXmlNodeModelIndex idx(item.toNodeModelIndex());
        QString name = idx.model()->stringValue(idx);

        QXmlQuery value(namePool);
        QString symbol;
        value.setFocus(item);
        value.setQuery("@value/string()");
        value.evaluateTo(&symbol);

        Item outItem;
        outItem["symbol"] = symbol.trimmed();
        outItem["name"] = name.trimmed();
        emit itemOut(outItem);
    }

    return true;
}

void EodDataStockExFetcher::start()
{
    QNetworkRequest request;
    request.setUrl(QString("%1/symbols.aspx").arg(m_eodDataUrl));
    request.setRawHeader("User-Agent", "Stocker 1.0");

    QNetworkReply *reply = m_mgr.get(request);
    connect(reply, SIGNAL(finished()), this, SLOT(onRequestFinished()));
}

void EodDataStockExFetcher::onRequestFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply *>(sender());
    int rc = -1;

    if (!reply)
        emit itemOut(ErrorItem("wrong sender in onRequestFinished"));
    else if (reply->error() != QNetworkReply::NoError)
        emit itemOut(ErrorItem(reply->errorString()));
    else
    {
        processData(reply->readAll());
        rc = 0;
    }

    reply->deleteLater();
    emit finished(rc);
}

PIPE_REGISTRATION(EodDataStockExFetcher)
