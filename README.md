# Pipo the  pipe builder
[![build status](https://gitlab.com/fargie_s/pipo/badges/master/build.svg)](https://gitlab.com/fargie_s/pipo/commits/master)
[![coverage report](https://gitlab.com/fargie_s/pipo/badges/master/coverage.svg)](https://gitlab.com/fargie_s/pipo/commits/master)

Pipo project is meant to create advanced unix-like pipes.

Unlike unix pipes, pipo exchanges JSon objects through the pipe.

## Specification

A pipe is a chain of pipe-elements processing pipe-items.

### Pipe-element

A pipe-element is an element of the pipeline.

Its name MUST be camelcase, starting with a capital letter.

It MAY have configuration options that MUST be camelcase (first letter lowercase).

### Pipe-items

A pipe-item is the base data being processed by the pipeline.

Json has been chosen as the base format for pipe-items.

Strings SHOULD be encoded using utf-8.

Raw data SHOULD be escaped using Base32 representation **FIXME**.

Three kind of pipe items exist :
-   Standard items, data being processed by the pipeline.
-   Configuration items, configuring one or more pipe-elements.
-   Error items, displaying details about an error that occured in the pipeline.

#### Configuration items

A configuration item contains configuration element for one or several pipe-elements.

Each pipe-element can be configured with an element in the Json object named
according to the pipe-element name using "_Config_" as a suffix, ex:
```json
{
  "RenameConfig" : {
      "property": "var",
      "newName": "newName"
  }
}
```

#### Error items

### Default pipe-elements

Some base pipe-elements MUST be implemented in all frameworks and all language
supported by this tool :
-   _StdIn_ : parse input Json objects on stdin.
-   _StdOut_ : print Json objects on stdout.
-   _SubPipe_ : create a child pipeline.

### Command-line

Pipo executables MUST work directly from an unix-like console, processing incoming
Json objects on their stdin and sending other objects on its stdout (using _StdIn_,
_StdOut_ base pipe-elements).

Any configuration option MAY be set on the command-line, as a long-option (\-\-optionName=xxx).

A special _help_ argument MUST be implement and SHOULD output the result of 'usage' command.
