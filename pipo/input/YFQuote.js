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
** Created on: 2017-06-11T09:05:22+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  yahoo = require('yahoo-finance'),
  debug = require('debug')('pipo:yahooFinance'),
  PipeElement = require('../PipeElement'),
  Item = require('../Item');


class YFQuote extends PipeElement {
  constructor() {
    super();
    this.modules = [ 'price' ];
  }

  onItem(item) {
    super.onItem(item);

    if (_.has(item, 'symbol')) {
      let symbol = Item.take(item, 'symbol');
      this.ref();
      try {
        yahoo.quote(
          { symbol: symbol, modules: Item.take(item, 'modules', this.modules) },
          (err, info) => {
            if (err) {
              this.error(err);
            } else if (_.isEmpty(info)) {
              this.error(`no info found for quote ${symbol}`);
            } else {
              this.emitItem(info);
            }
            this.unref();
          }
        );
      } catch (err) {
        debug('err:', err);
        this.error('something went wrong');
        this.unref();
      }

    }
    this.emitItem(item);
  }
}

module.exports = YFQuote;
