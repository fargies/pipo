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

#include "PipeBuilderParseCtx.hpp"

#include "PipeBuilder.hpp"
#include "PipeBuilderParser.hpp"
#include "PipeBuilderScanner.hpp"

PipeBuilderParseCtx::PipeBuilderParseCtx(PipeBuilder &builder) :
    m_builder(builder)
{
    yylex_init(&m_scan);
}

PipeBuilderParseCtx::~PipeBuilderParseCtx()
{
    delPipe();
    yylex_destroy(m_scan);
}

InputPipe *PipeBuilderParseCtx::parse(const QString &string)
{
#ifdef PIPO_YYDEBUG
    yydebug = 1;
#endif
    m_args.clear();
    m_errorString.clear();

    yy_scan_string(qPrintable(string), m_scan);
    int rc = yyparse(this);
    yypop_buffer_state(m_scan);
    if (rc == 0)
    {
        Pipe *p = m_pipes.first();
        m_pipes.clear();
        return static_cast<InputPipe *>(p);
    }
    else
    {
        delPipe();
        return 0;
    }
}

bool PipeBuilderParseCtx::addPipe(const QString &pipeName)
{
    Pipe *pipe = m_builder.createPipe(pipeName, m_args);
    m_args.clear();
    if (pipe)
    {
        if (!m_pipes.empty())
        {
            Pipe *last = m_pipes.last();
            last->next(*pipe);
            pipe->setParent(last);
        }
        m_pipes.append(pipe);
    }
    else
        m_errorString = m_builder.errorString();
    return pipe != 0;
}

bool PipeBuilderParseCtx::addInputPipe(const QString &pipeName)
{
    Pipe *pipe = m_builder.createInputPipe(pipeName, m_args);
    m_args.clear();
    if (pipe)
    {
        if (!m_pipes.empty())
        {
            Pipe *last = m_pipes.last();
            last->next(*pipe);
            pipe->setParent(last);
        }
        m_pipes.append(pipe);
    }
    else
        m_errorString = m_builder.errorString();
    return pipe != 0;
}

void PipeBuilderParseCtx::addArg(const QString &arg)
{
    m_args.append(QVariant(arg));
}

void PipeBuilderParseCtx::addQuotedArg(const QString &arg)
{
    m_args.append(QVariant(arg.mid(1, arg.size() - 2)));
}

void PipeBuilderParseCtx::delPipe()
{
    if (!m_pipes.isEmpty())
    {
        delete m_pipes.first();
        m_pipes.clear();
    }
}
