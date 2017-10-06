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
** Created on: 2016-11-01T17:29:47+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  DataIn = require('./DataIn'),
  debug = require('debug')('pipo:in');

class StdIn extends DataIn {
  constructor(fd) {
    super();
    this.wait = false;
    this._opts = { noSeparateConfig: true };
    this.fd = _.defaultTo(fd, process.stdin);
    this.ref(); /* own ref */

    this.fd.on('data', (chunk) => {
      debug('chunk: %i bytes', chunk.length);
      this.add(chunk);
    });
    this.fd.on('end', () => {
      debug('file ended');
      _.forEach(this._waiting, this.emitItem.bind(this));
      delete this._waiting;
      this.end(0);
    });
  }

  onItem(item) {
    super.onItem(item);

    if (_.isEmpty(item)) {
      return;
    }
    else if (this.wait && !_.isNil(this.fd)) {
      (this._waiting || (this._waiting = [])).push(item);
    }
    else {
      this.emitItem(item);
    }
  }
}

module.exports = StdIn;
