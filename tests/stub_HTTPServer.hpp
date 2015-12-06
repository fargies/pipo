/*
** stub_HTTPServer.hpp
**
**        Created on: Jan 08, 2012
*/

#ifndef __STUB_HTTPSERVER_HH__
#define __STUB_HTTPSERVER_HH__

#include <QTcpServer>
#include <QMap>
#include <QString>

class QTcpSocket;

class HTTPServerStub : public QTcpServer
{
    Q_OBJECT
public:
    HTTPServerStub(QObject* parent = 0);
    virtual ~HTTPServerStub();

    void incomingConnection(qintptr socket);

    inline void add(const QString &path, const QString &data)
    {
        m_data.insert(path, data);
    }

    inline void clear()
    {
        m_data.clear();
    }

    QString baseUri() const;

    void setAuth(const QString &user, const QString &pass);

private slots:
    void readClient();

    void discardClient();

protected:
    void sendFile(const QString &file, QTcpSocket &socket);
    void sendAuthRequired(QTcpSocket &socket);
    void sendForbidden(QTcpSocket &socket);
    bool isAuth() const;

    QMap<QString, QString> m_data;
    QByteArray m_auth_data;
};

#endif

