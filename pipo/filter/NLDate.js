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
** Created on: 2017-09-05T15:19:48+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  date = require('date.js'),
  moment = require('moment'),
  PipeElement = require('../PipeElement');

/* Native language parsing dates */
class NLDate extends PipeElement {
  constructor() {
    super();
    this.property = null;
    this.format = null;
  }

  onItem(item) {
    super.onItem(item);
    var config = this.takeConfig(item);
    if (config) {
      this.emit('item', config);
    }

    if (!_.isNil(this.property) && _.has(item, this.property)) {
      item[this.property] = moment(date(item[this.property]))
        .format(this.format);
    }
    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = NLDate;
