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
 **        Created on: 12/3/2015
 **   Original Author: fargie_s
 **
 **/

#include <QNetworkReply>
#include <QNetworkRequest>
#include <QXmlQuery>
#include <QXmlResultItems>

#include "ErrorItem.hpp"

#include "XQueryFetcher.hpp"
#include "HtmlTidy.hpp"


XQueryFetcher::XQueryFetcher(
        const QString &url,
        const QString &query,
        const QJsonObject &subQueries,
        QObject *parent) :
    InputPipe(parent),
    m_url(url),
    m_query(query),
    m_subQueries(subQueries)
{
}

void XQueryFetcher::setUrl(const QString &url)
{
    m_url = url;
}

QString XQueryFetcher::usage(const QString &usage)
{
    return usage + "\n"
                   "{ \"xml\" : \"<xmldata>\",\n"
                   "  \"query\" : \"XQuery\",\n"
                   "  \"subQueries\" : { \"outPropName\" : \"XQuery\" }\n} ->"
                   " XQuery -> { \"outPropName\" : \"match\" }\n";
}

void XQueryFetcher::start()
{
    QNetworkRequest request;
    request.setUrl(m_url);
    request.setRawHeader("User-Agent", "Pipo 1.0");

    QNetworkReply *reply = m_mgr.get(request);
    connect(reply, SIGNAL(finished()), this, SLOT(onRequestFinished()));
}

void XQueryFetcher::onRequestFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply *>(sender());
    int rc = -1;

    if (!reply)
        emit itemOut(ErrorItem("internal error in XQueryFetcher"));
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

bool XQueryFetcher::processData(const QByteArray &data)
{
    QString html = HtmlTidy::tidyfy(QString(data));
    if (html.isEmpty())
    {
        emit itemOut(ErrorItem("failed to parse html content"));
        return false;
    }
    QXmlNamePool namePool;
    QXmlQuery query(namePool);
    QXmlResultItems queryResult;

    query.setFocus(html);
    query.setQuery(m_query);
    query.evaluateTo(&queryResult);

    if (!query.isValid() || queryResult.hasError()) {
        emit itemOut(ErrorItem(QString("failed to extract data from %1").arg(m_url)));
        return false;
    }

    for (QXmlItem xmlNode = queryResult.next();
         !xmlNode.isNull();
         xmlNode = queryResult.next())
    {
        Item item;
        foreach (const QString &key, m_subQueries.keys())
        {
            QXmlQuery query(namePool);
            QString value;

            query.setFocus(xmlNode);
            query.setQuery(m_subQueries.value(key).toString());
            if (query.evaluateTo(&value))
                item.insert(key, value);
        }
        if (!item.isEmpty())
            emit itemOut(item);
    }

    return true;
}
