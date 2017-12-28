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
** Created on: 2017-10-09T14:13:27+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  math = require('mathjs'),
  _ = require('lodash'),
  debug = require('debug')('pipo:math'),
  Item = require('../Item'),
  PipeElement = require('../PipeElement');

class MathFilter extends PipeElement {
  constructor() {
    super();
    this.expr = null;
  }

  _filter(expr, item) {
    if (math.eval(expr, item)) {
      debug('item matches %s', expr);
      this.emitItem(item);
    }
  }

  onItem(item) {
    super.onItem(item);

    var hasExpr = _.has(item, 'expr');
    var expr = Item.take(item, 'expr', this.expr);
    if (!_.isNil(expr) && (hasExpr || !_.isEmpty(item))) {
      try {
        // FIXME: check why math.eval modifies item
        this._filter(expr, _.cloneDeep(item));
      }
      catch (err) {
        debug(err);
        if (hasExpr) {
          /* silently discarding if item doesn't have expr,
              not all packets are worth it */
          this.error(err);
        }
      }
    }
    else {
      this.emitItem(item);
    }
  }
}

module.exports = MathFilter;
