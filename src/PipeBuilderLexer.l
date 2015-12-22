%option noyywrap nodefault yylineno reentrant bison-bridge

%{
#include "PipeBuilderParseCtx.hpp"
#include "PipeBuilderParser.hpp"

#include <string.h>

%}

TS    [[:space:]]+
NUMBER [[:digit:]]+
WORD [a-zA-Z0-9]+
QUOTED (\"([^\"]|\\.)*\"|\'([^\']|\\\\.)*\')

%%
%{
    PipeBuilderParseCtx *pp = static_cast<PipeBuilderParseCtx*>(yyextra);
%}

^{TS}?\#.*\n   { /* ignore comments */ }
,              { return COMMA; }
\(             { return LPAR; }
\)             { return RPAR; }
{WORD}         { yylval->sval = strdup(yytext); return STRING; }
\|             { return PIPESEP; }
{QUOTED}       { yylval->sval = strdup(yytext); return QUOTED; }

\n { }
[ \t] { /* ignore whitespace */ }
. { return ERROR; }
%%

