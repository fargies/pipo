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
  debug = require('debug')('pipo:file'),
  PipeElement = require('./PipeElement'),
  StdIn = require('./StdIn'),
  SubPipe = require('./SubPipe'),
  fs = require('fs');

class FilePipe extends PipeElement {
  constructor(file) {
    super();
    this.file = null;
    this._pipe = null;

    if (!_.isNil(file)) {
      this.setFile(file);
    }
  }

  setFile(file) {
    if (_.isArray(this._pipe)) {
      _.forEach(this._pipe, (p) => { p.removeAllListeners(); });
      this.unref();
    }

    this.ref();
    this.file = file;
    this._pipe = [ new StdIn(fs.createReadStream(file)), new SubPipe() ];
    this._pipe[0].next(this._pipe[1]);
    this._pipe[1].on('end', this.end.bind(this));
    this._pipe[1].on('item', this.emit.bind(this, 'item'));
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
      this.emit('item', item);
    }
  }
}

module.exports = FilePipe;
