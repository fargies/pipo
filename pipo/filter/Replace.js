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
** Created on: 2017-02-04T14:27:13+01:00
**     Author: Fargier Sylvain <fargie_s> <fargier.sylvain@free.fr>
*/

const
  _ = require('lodash'),
  utils = require('../utils'),
  debug = require('debug')('pipo:replace'),
  PipeElement = require('../PipeElement');

// FIXME: rename as StrReplace/StrSubstr ?
class Replace extends PipeElement {
  constructor() {
    super();
    this.property = null;
    this.pattern = null;
    this.newSubstr = null;
    this._opts = { noSeparateConfig: true }; /* can replace in config */
  }

  onItem(item) {
    super.onItem(item);

    if (!_.isNil(this.property) && !_.isNil(this.pattern) &&
        !_.isNil(this.newSubstr)) {
      if (_.has(item, this.property)) {
        debug('replacing "%s" by "%s"', this.pattern, this.newSubstr);
        _.set(item, this.property,
          _.replace(_.get(item, this.property), this.pattern, this.newSubstr));
      }
    }

    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }

  setPattern(pattern) {
    try {
      this.pattern = utils.getPattern(pattern);
    }
    catch(e) {
      this.error(e);
    }
  }
}

module.exports = Replace;
