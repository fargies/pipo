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
** Created on: 2016-11-04T22:31:41+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  debug = require('debug')('pipo:registry'),
  fs = require('fs'),
  path = require('path');

class Registry {
  constructor() {
    this.pipes = {};
  }

  findAll() {
    this.crawl(__dirname, {
      ignore: [ 'utils', 'PipeElement.js', 'Registry.js', 'DataIn.js' ],
      preload: false
    });
  }

  get(elt) {
    var pipe = this.pipes[elt];
    if (_.isString(pipe)) {
      pipe = this.load(pipe);
      if (_.isNil(pipe)) {
        delete this.pipes[elt];
      }
    }
    return pipe;
  }

  load(file) {
    if (file.endsWith('.js')) {
      try {
        let pipeElt = require(file);
        if (pipeElt.prototype instanceof PipeElement) {
          debug('registering', pipeElt.name);
          this.add(pipeElt.name, pipeElt);
        }
        return pipeElt;
      } catch(e) {
        debug('failed to register "%s":', file, e);
      }
    }
    else if (file.endsWith('.json')) {
      let pipeElt = FilePipe.bind(file);
      this.add(path.parse(file).name, pipeElt);
      return pipeElt;
    }
    else {
      return null;
    }
  }

  add() {
    if (arguments.length < 1) {
      throw Error('invalid arguments');
    }
    var arg = arguments[0];
    if (_.isString(arg)) {
      if (arguments.length < 2) {
        throw Error('invalid arguments');
      }
      this.pipes[arg] = arguments[1];
    } else if (_.isObject(arg)) {
      _.assign(this.pipes, arg);
    } else {
      throw Error(`invalid argument type: ${typeof(arg)}`);
    }
  }

  crawl(dir, opts) {
    debug(`crawling "${dir}"`);
    var files = fs.readdirSync(dir);
    _.forEach(files,  (file) => {
      if (_.includes(_.get(opts, 'ignore'), file)) {
        return;
      }
      file = dir + '/' + file;
      let stat = fs.statSync(file);
      let fileParse = path.parse(file);

      if (stat.isFile() && _.includes([ '.json', '.js' ], fileParse.ext)) {
        if (_.get(opts, 'preload', true)) {
          this.load(file);
        }
        else {
          this.pipes[fileParse.name] = file;
        }
      } else if (stat.isDirectory() && _.get(opts, 'recurse', true)) {
        this.crawl(file, opts);
      }
    });
  }

  remove(element) {
    _.unset(this.pipes, element);
  }
}

const registry = new Registry();
module.exports = registry;

const
  FilePipe = require('./FilePipe'),
  PipeElement = require('./PipeElement');

registry.findAll();
