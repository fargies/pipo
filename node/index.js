#!env node
'use strict';
/*
** Copyright (C) 2016 Sylvain Fargier
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
** Created on: 2016-11-26T10:48:50+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  dashdash = require('dashdash'),
  timers = require('timers'),
  fs = require('fs'),
  q = require('q'),
  debug = require('debug')('pipo:exe');

const pipo = require('./pipo');

const options = [
  {
    names: [ 'help', 'h' ],
    type: 'bool',
    help: 'Print this help and exit.'
  },
  {
    names: [ 'list-pipes', 'l' ],
    type: 'bool',
    help: 'List available pipe elements'
  },
  {
    names: [ 'no-std' ],
    type: 'bool',
    help: 'Do not add StdIn|StdOut elements'
  }
];


var parser = dashdash.createParser({options: options});
try {
    var opts = parser.parse(process.argv);
} catch (e) {
    console.error('pipo: error: %s', e.message);
    process.exit(1);
}

function addPipe(pipeLine, pipe) {
  _.invoke(_.last(pipeLine), 'next', pipe);
  pipeLine.push(pipe);
  return pipe;
}

// Use `parser.help()` for formatted options help.
if (opts.help) {
  var help = parser.help({includeEnv: true}).trimRight();
  console.log('usage: node ./pipo.js [options] [pipe expression]\n' +
              'pipe expression: Elt[#name]|Elt[#name]' +
              'options:\n' +
              help);
  process.exit(0);
} else if (opts.list_pipes) {
  _.forOwn(pipo.Registry.pipes, function(ctor, name) {
    console.log(name);
  });
  process.exit(0);
  // List available pipes
} else {
  let pipeLine = [];
  q()
  .then(() => {
    var proms = _.map(opts._args, function(value) {
      return q.nfcall(fs.access, value, (fs.constants || fs).R_OK)
      .then(
        () => { /* an input file */
          addPipe(pipeLine, new pipo.StdIn(fs.createReadStream(value)));
        },
        () => { /* a pipe expression */
          _.forIn(_.split(value, '|'), function(elt) {
            let info = _.split(elt, '#');
            if (!(info[0] in pipo.Registry.pipes)) {
              throw `Can\'t find ${info[0]} element`;
            }
            let pipe = addPipe(pipeLine, new pipo.Registry.pipes[info[0]]());
            if (info[1]) {
              pipe.setName(info[1]);
            }
          });
        }
      );
    });
    return q.all(proms);
  })
  .then(() => {
    if (_.isEmpty(pipeLine) || _.each(pipeLine, function(elt) { return elt instanceof pipo.StdIn; })) {
      addPipe(pipeLine, new pipo.SubPipe());
    }
    if (!opts.no_std) {
      if (!(_.first(pipeLine) instanceof pipo.StdIn)) {
        let pipe = new pipo.StdIn();
        pipe.next(_.first(pipeLine));
        pipeLine.unshift(pipe);
      }
      if (!(_.last(pipeLine) instanceof pipo.StdOut)) {
        addPipe(pipeLine, new pipo.StdOut());
      }
    }
    if (debug.enabled) {
      debug('PipeLine: ' + _.map(pipeLine, function(elt) { return _.get(elt, 'constructor.name'); }).join('|'));
    }
    _.invoke(_.first(pipeLine), 'start');
  })
  .then(() => {
    /* wait for pipe to finish */
    var timer = timers.setInterval(() => {}, 500);
    _.last(pipeLine).on('end', () => {
      timers.clearInterval(timer);
    });
  })
  .done();

}
