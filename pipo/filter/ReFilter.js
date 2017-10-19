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
  utils = require('../utils'),
  debug = require('debug')('pipo:filter:re'),
  PipeElement = require('../PipeElement');

class ReFilter extends PipeElement {
  constructor() {
    super();
    this.property = null;
    this.pattern = null;
  }

  onItem(item) {
    super.onItem(item);

    if (!_.isEmpty(item)) {
      if (_.isNil(this.property) || _.isNil(this.pattern)) {
        this.emit('item', item);
      } else if (_.has(item, this.property) &&
          _.toString(item[this.property]).match(this.pattern)) {
        debug('item match on "%s"', this.property);
        this.emit('item', item);
      }
    }
  }

  setPattern(pattern) {
    utils.setPipePattern(this, 'pattern', pattern);
  }
}

module.exports = ReFilter;
