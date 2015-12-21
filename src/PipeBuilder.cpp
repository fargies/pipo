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
 **        Created on: 11/25/2015
 **   Original Author: fargie_s
 **
 **/

#include <QMetaType>
#include <QMetaObject>

#include "PipeBuilder.hpp"
#include "PipeBuilderParseCtx.hpp"

PipeBuilder::PipeBuilder(QObject *parent) : QObject(parent)
{

}

QList<Pipe *> PipeBuilder::parsePipe(const QString &text)
{
    PipeBuilderParseCtx ctx(*this);
    QList<Pipe *> inPipe = ctx.parse(text);
    m_errorString = ctx.errorString();
    return inPipe;
}

static bool isParentOf(const QMetaObject *object, const QMetaObject &parent)
{
    while (object)
    {
        if (object == &parent)
            return true;
        object = object->superClass();
    }
    return false;
}

InputPipe *PipeBuilder::createInputPipe(const QString &pipeName, const QVariantList &args)
{
    m_errorString.clear();
    int type = QMetaType::type(qPrintable(pipeName + "*"));

    if (type <= 0)
    {
        m_errorString = tr("unknown Pipe object: %1").arg(pipeName);
        return 0;
    }
    const QMetaObject *metaObject = QMetaType::metaObjectForType(type);
    if (!isParentOf(metaObject, InputPipe::staticMetaObject))
    {
        m_errorString = tr("not an InputPipe: %1").arg(pipeName);
        return 0;
    }

    return static_cast<InputPipe*>(createObject(metaObject, args));
}

Pipe *PipeBuilder::createPipe(const QString &pipeName, const QVariantList &args)
{
    m_errorString.clear();
    int type = QMetaType::type(qPrintable(pipeName + "*"));

    if (type <= 0)
    {
        m_errorString = tr("unknown Pipe object: %1").arg(pipeName);
        return 0;
    }
    const QMetaObject *metaObject = QMetaType::metaObjectForType(type);
    if (!isParentOf(metaObject, Pipe::staticMetaObject))
    {
        m_errorString = tr("not a Pipe: %1").arg(pipeName);
        return 0;
    }

    return static_cast<InputPipe*>(createObject(metaObject, args));
}

QObject *PipeBuilder::createObject(const QMetaObject *meta, const QVariantList &args)
{
    QVector<QGenericArgument> genArgs(9);
    for (int i = 0; i < args.size(); ++i)
    {
        const QVariant &varg(args.at(i));
        genArgs[i] = QGenericArgument(varg.typeName(), varg.data());
    }

    QObject *obj = meta->newInstance(
                genArgs[0], genArgs[1], genArgs[2], genArgs[3],
                genArgs[4], genArgs[5], genArgs[6], genArgs[7],
                genArgs[8]);
    if (!obj)
    {
        m_errorString = tr("failed to build Pipe object "
                           "(Q_INVOKABLE missing ?): %1").arg(meta->className());
        return 0;
    }
    return obj;
}
