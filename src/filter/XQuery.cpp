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

#include <QXmlQuery>
#include <QXmlResultItems>

#include "ErrorItem.hpp"
#include "XQuery.hpp"

XQuery::XQuery(QObject *parent) :
    Pipe(parent),
    m_trim(true)
{

}

bool XQuery::itemIn(const Item &item)
{
    const QString xml = item.value("xml").toString();

    if (Pipe::itemIn(item))
        return true;
    else if (xml.isEmpty() || !item.contains("query") || !item.contains("subQueries"))
        emit itemOut(item);
    else
    {

        const QString queryStr(item.value("query").toString());
        const QJsonObject subQueries(item.value("subQueries").toObject());
        QXmlNamePool namePool;
        QXmlQuery query(namePool);
        QXmlResultItems queryResult;

        query.setFocus(xml);
        query.setQuery(queryStr);
        query.evaluateTo(&queryResult);

        if (!query.isValid() || queryResult.hasError()) {
            emit itemOut(ErrorItem(QString("invalid query \"%1\"").arg(queryStr)));
            return true;
        }

        for (QXmlItem xmlNode = queryResult.next();
             !xmlNode.isNull();
             xmlNode = queryResult.next())
        {
            Item out;
            foreach (const QString &key, subQueries.keys())
            {
                QXmlQuery subQuery(namePool);
                QString value;
                QString subQueryStr(subQueries.value(key).toString());

                if (!subQueryStr.startsWith('.'))
                    subQueryStr.prepend('.');

                subQuery.setFocus(xmlNode);
                subQuery.setQuery(subQueryStr);
                if (subQuery.evaluateTo(&value))
                {
                    if (m_trim)
                        out.insert(key, value.trimmed());
                    else
                        out.insert(key, value);
                }
            }
            if (!out.isEmpty())
                emit itemOut(out);
        }
        return true;
    }
}

QString XQuery::usage(const QString &usage)
{
    return usage + "\n"
                   "{\n"
                   "  \"xml\" : \"<xmldata>\",\n"
                   "  \"query\" : \"XQuery\",\n"
                   "  \"subQueries\" : { \"outPropName\" : \"XQuery\" }\n} ->"
                   " XQuery -> { \"outPropName\" : \"match\" }\n"
                   "{ \"XQueryConfig\" : { \"trim\" : 1, \"async\" : 0 } } -> XQuery\n";
}

void XQuery::setTrim(bool value)
{
    m_trim = value;
}

PIPE_REGISTRATION(XQuery)
