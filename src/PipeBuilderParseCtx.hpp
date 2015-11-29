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
 **        Created on: 11/27/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef PIPEBUILDERPARSECTX_HPP
#define PIPEBUILDERPARSECTX_HPP

#include <QString>
#include <QVariantList>
#include <QDebug>

#include "Pipe.hpp"
#include "InputPipe.hpp"

#ifndef YY_TYPEDEF_YY_SCANNER_T
#define YY_TYPEDEF_YY_SCANNER_T
typedef void* yyscan_t;
#endif

class PipeBuilder;

class PipeBuilderParseCtx
{
public:
    PipeBuilderParseCtx(PipeBuilder &builder);
    ~PipeBuilderParseCtx();

    InputPipe *parse(const QString &string);

    inline yyscan_t scaninfo() const
    { return m_scan; }

    bool addPipe(const QString &pipeName);
    bool addInputPipe(const QString &pipeName);

    void addArg(const QString &arg);

    void addQuotedArg(const QString &arg);

    void delPipe();

    inline const QString &errorString() const
    { return m_errorString; }

    inline const QVariantList &args() const
    { return m_args; }

protected:
    PipeBuilder &m_builder;
    yyscan_t m_scan;
    QVariantList m_args;
    QList<Pipe *> m_pipes;
    QString m_errorString;
};

#endif // PIPEBUILDERPARSECTX_HPP
