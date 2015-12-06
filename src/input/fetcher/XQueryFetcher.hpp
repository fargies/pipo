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

#ifndef XQUERYFETCHER_HPP
#define XQUERYFETCHER_HPP

#include <QObject>
#include <QNetworkAccessManager>

#include "InputPipe.hpp"

/**
 * @brief Generate data according to the given XQuery request
 */
class XQueryFetcher : public InputPipe
{
    Q_OBJECT
public:

    /**
     * @brief XQueryFetcher
     * @param[in] url the url where to do the request
     * @param[in] query the main query
     * @param[in] subQueries information to extract
     * @param[in] parent parent QObject
     */
    Q_INVOKABLE
    XQueryFetcher(const QString &url,
                  const QString &query,
                  const QJsonObject &subQueries,
                  QObject *parent = 0);

    inline const QString &url() const
    { return m_url; }
    void setUrl(const QString &url);

    QString usage(const QString &usage);

    void start();

protected slots:
    void onRequestFinished();

protected:
    bool processData(const QByteArray &data);

protected:
    QString m_url;
    QString m_query;
    QJsonObject m_subQueries;
    QNetworkAccessManager m_mgr;
};

#endif // XQUERYFETCHER_HPP
