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
** Created on: 2017-02-04T09:40:45+01:00
**     Author: Fargier Sylvain <fargie_s> <fargier.sylvain@free.fr>
*/


const
  _ = require('lodash'),
  PipeElement = require('../PipeElement'),
  Registry = require('../Registry');

function testRe(item, re, name) {
  return _.has(item, name) && _.toString(item[name]).match(re);
}

class ReFilter extends PipeElement {
  constructor() {
    super();
    this.filter = {};
  }

  onItem(item) {
    super.onItem(item);
    var config = this.takeConfig(item);
    if (config) {
      this.emit('item', config);
    }

    if (!_.isEmpty(item) && _.every(this.filter, testRe.bind(null, item))) {
      this.emit('item', item);
    }
  }

  setFilter(filter) {
    try {
      this.filter = _.mapValues(filter, function(re) {
        if (_.isArray(re)) {
          return new RegExp(re[0], re[1]);
        } else {
          return new RegExp(re);
        }
      });
    }
    catch(e) {
      this.error(e);
    }
  }
}

Registry.add('ReFilter', ReFilter);

module.exports = ReFilter;
