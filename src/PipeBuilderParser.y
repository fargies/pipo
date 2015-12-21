
%pure-parser

%parse-param { PipeBuilderParseCtx *pp }
%lex-param   { yyscan_t *YYLEX_PARAM }

%union
{
  int ival;
  char *sval;
  void *vval;
}

%{

#include "PipeBuilderScanner.hpp"

#define YYLEX_PARAM pp->scaninfo()

void yyerror(PipeBuilderParseCtx *pp, const char *s);

#ifdef PIPO_YYDEBUG

static void print_token_value (FILE *, int, YYSTYPE);
#define YYPRINT(file, type, value) print_token_value (file, type, value)

#endif

%}
%code requires {
#include "PipeBuilderParseCtx.hpp"
}

/* declare tokens */
%token <sval> STRING "string"
%token <sval> QUOTED "quoted"
%token PIPESEP "pipe"
%token LPAR "("
%token RPAR ")"
%token COMMA ","
%token EOL "eol"
%token END 0 "eof"
%token ERROR

%start pipes
%%

pipes:
  pipe
| pipes PIPESEP pipe
;

pipe:
STRING args
{
    if (!pp->addPipe(QLatin1String($<sval>1)))
        YYERROR;
    free($<sval>1);
}
;

args:
| args arg
| funcargs
;

funcargs:
  LPAR RPAR
| LPAR funcarglist arg RPAR
;

funcarglist:
| funcarglist arg COMMA
;

arg:
  STRING
{
    pp->addArg(QLatin1String($<sval>1));
    free($<sval>1);
}
| QUOTED
{
    pp->addQuotedArg(QLatin1String($<sval>1));
    free($<sval>1);
}
;

%%

#ifdef PIPO_YYDEBUG
static void print_token_value (FILE *file, int type, YYSTYPE value)
{
  switch (type) {
    case STRING:
    case QUOTED:
      fprintf(file, "%s", value.sval);
      break;
  }
}
#endif

void yyerror(PipeBuilderParseCtx */*pp*/, const char *s)
{
    fprintf(stderr, "PipeBuilderParseCtx: %s\n", s);
}

