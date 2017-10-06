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
** Created on: 2017-10-01T10:25:09+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  Item = require('../Item'),
  debug = require('debug')('pipo:serial'),
  PipeElement = require('../PipeElement'),
  SubPipe = require('../SubPipe');

class SerialPipe extends SubPipe {
  constructor() {
    super();
    delete this.oneShot;
    this._queue = [];
  }

  onItem(item) {
    if (this._subRef !== 0) {
      this._queue.push(item);
      this.ref();
      debug('item queued');
      return;
    }

    PipeElement.prototype.onItem.call(this, item);
    if (_.has(item, 'pipe')) {
      this.setPipe(Item.take(item, 'pipe'));
    }

    if (_.isEmpty(item)) {
      return;
    }
    else if (_.isEmpty(this.pipe)) {
      this.emitItem(item);
    }
    else {
      var pipe = this.createPipe(this.pipe);
      this.pipeInvoke(pipe, 'onItem', item);
      this.pipeInvoke(pipe, 'end', 0);
    }
  }

  subEnd(status) {
    super.subEnd(status);
    if ((this._subRef === 0) && (!_.isEmpty(this._queue))) {
      debug('starting next pipe');
      this.onItem(this._queue.shift());
      this.unref();
    }
  }
}

module.exports = SubPipe;


module.exports = SerialPipe;
