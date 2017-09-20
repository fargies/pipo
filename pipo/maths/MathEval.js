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
** Created on: 2017-09-06T09:47:57+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  math = require('mathjs'),
  _ = require('lodash'),
  debug = require('debug')('pipo:math'),
  PipeElement = require('../PipeElement');

class MathEval extends PipeElement {
  constructor() {
    super();
    this.expr = null;
    this.property = "result";
  }

  onItem(item) {
    super.onItem(item);
    var config = this.takeConfig(item);
    if (config) {
      this.emit('item', config);
    }

    if (_.has(item, 'expr')) {
      try {
        item[this.property] = math.eval(item.expr, item);
        delete item['expr'];
      }
      catch (err) {
        this.error(err);
      }
    }
    else if (!_.isNil(this.expr) && !_.isEmpty(item)) {
      try {
        item[this.property] = math.eval(this.expr, item);
      }
      catch (err) {
        /* silently discarding, not all packets are worth it */
        debug(err);
      }
    }

    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = MathEval;
