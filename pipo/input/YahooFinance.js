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


class YahooFinance extends PipeElement {
  constructor() {
    super();
    this.symbol = null;
  }

  onItem(item) {
    super.onItem(item);
    if (_.has(item, 'from') && _.has(item, 'to')) {
      let symbol = Item.take(item, 'symbol', this.symbol);
      if (_.isNil(symbol)) {
        debug('no symbols to fetch');
      }
      else {
        this.ref();
        try {
          yahoo.historical(
            { symbol: symbol, from: Item.take(item, 'from'),
              to: Item.take(item, 'to') },
            (err, quotes) => {
              if (err) {
                this.error(err);
              } else if (_.isEmpty(quotes)) {
                this.error('no quotes found');
              } else {
                this.emit('item', { quotes: quotes });
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
    }
    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = YahooFinance;
