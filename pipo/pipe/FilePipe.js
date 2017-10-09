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
** Created on: 2017-09-24T14:33:29+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  fs = require('fs'),
  debug = require('debug')('pipo:filepipe'),
  season = require('season'),
  StdIn = require('../StdIn'),
  SubPipe = require('../SubPipe'),
  PipeElement = require('../PipeElement');

class CSonFileIn extends PipeElement {
  constructor(file) {
    super();
    this.wait = false;
    this._opts = { noSeparateConfig: true };
    this.ref();

    season.readFile(file, (err, item) => {
      debug('file ended');
      var ret;
      if (!_.isNil(err)) {
        this.error(err);
        ret = -1;
      }
      else {
        this.emitItem(item);
        ret = 0;
      }
      this.wait = false;
      _.forEach(this._waiting, this.emitItem.bind(this));
      delete this._waiting;
      this.end(ret);
    });
  }
  onItem(item) {
    super.onItem(item);

    if (!_.isEmpty(item) && this.wait) {
      (this._waiting || (this._waiting = [])).push(item);
    }
    else {
      this.emitItem(item);
    }
  }
}

class FilePipe extends PipeElement {
  constructor(file) {
    super();
    this.file = null;
    this.wait = true;
    this._pipe = null;

    if (!_.isNil(file)) {
      this.noConfig = true; /* filter out incoming config elements */
      this.setFile(file);
    }
    else {
      this.noConfig = false;
    }
    this._opts = { noSeparateConfig: !this.noConfig };
  }

  setNoConfig(state) {
    this.noConfig = state;
    this._opts = { noSeparateConfig: !state };
  }

  setFile(file) {
    if (_.isArray(this._pipe)) {
      _.forEach(this._pipe, (p) => { p.removeAllListeners(); });
    }
    else {
      this.ref();
    }

    debug('loading', file);
    this.file = file;
    this._pipe = [
      file.endsWith('.cson') ?
        new CSonFileIn(file) : new StdIn(fs.createReadStream(file)),
      new SubPipe()
    ];
    this._pipe[0].wait = this.wait;
    this._pipe[0].ref();
    this._pipe[0].next(this._pipe[1]);
    this._pipe[1].once('end', (status) => {
      this.deletePipe();
      this.end(status);
    });
    this._pipe[1].on('item', this.emitItem.bind(this));
  }

  deletePipe() {
    _.forEach(this._pipe, (p) => { p.removeAllListeners(); });
    this._pipe = null;
  }

  onItem(item) {
    super.onItem(item);

    if (_.isNil(item)) {
      return;
    }
    else if (_.isArray(this._pipe)) {
      this._pipe[0].onItem(item);
    }
    else {
      this.emitItem(item);
    }
  }

  end(status) {
    super.end(status);

    if (!_.isEmpty(this._pipe) && this._ref <= 1) {
      this._pipe[0].end(status);
    }
  }
}

module.exports = FilePipe;
