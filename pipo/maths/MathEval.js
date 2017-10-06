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
  regression = require('regression'),
  _ = require('lodash'),
  debug = require('debug')('pipo:math'),
  Item = require('../Item'),
  PipeElement = require('../PipeElement');

function toJson(data) {
  if (_.hasIn(data, 'valueOf')) {
    data = data.valueOf();
  }
  if (_.isArray(data)) {
    data = _.map(data, toJson);
  }
  return data;
}

math.import({
  count: function(val) { return _.size(val); },
  linReg: function(data) {
    data = toJson(data);
    return regression.linear(data, { order: 4, precision: 4 }).equation;
  }
});

class MathEval extends PipeElement {
  constructor() {
    super();
    this.expr = null;
    this.property = "result";
  }

  onItem(item) {
    super.onItem(item);

    var hasExpr = _.has(item, 'expr');
    var expr = Item.take(item, 'expr', this.expr);
    if (!_.isNil(expr) && (hasExpr || !_.isEmpty(item))) {
      try {
        var ret = toJson(math.eval(expr, item));
        _.set(item, this.property, ret);
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

    this.emitItem(item);
  }
}

module.exports = MathEval;
