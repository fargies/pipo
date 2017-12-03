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

/**
 * @module YFQuote
 * @description YahooFinance quote information fetcher
 *
 * ### Configuration
 * | Name         | Type         | Default     | Description          |
 * | :----------- | :-----       | :-----      | :------------------- |
 * | [`modules`]  | string array | [ "price" ] | information to fetch |
 *
 * ### Items
 * | Name        | Type         | Description         |
 * | :---------- | :-----       | :------------------ |
 * | `symbol`    | string       | symbol to fetch     |
 * | [`modules`] | string array | information to fetch |
 *
 * ### Details
 *
 * *modules* can contain: "recommendationTrend", "summaryDetail", "earnings",
 * "calendarEvents", "upgradeDowngradeHistory", "price", "defaultKeyStatistics",
 * "summaryProfile", "financialData".
 *
 * For more information see: [node-yahoo-finance](https://github.com/pilwon/node-yahoo-finance/blob/master/docs/quote.md)
 *
 * @example
 * {
 *   "pipe": "YFQuote",
 *   "modules": [ "price" ],
 *   "symbol": "CLA.PA"
 * }
 * ===
 * {
 *   "price": {
 *     "maxAge": 1,
 *    "regularMarketChangePercent": 0.004255328,
 *    "regularMarketChange": 0.002000004,
 *    "regularMarketTime": "2017-10-20T15:35:13.000Z",
 *    "priceHint": 3,
 *    "regularMarketPrice": 0.472,
 *    "regularMarketDayHigh": 0.474,
 *    "regularMarketDayLow": 0.466,
 *    "regularMarketVolume": 1762433,
 *    "regularMarketPreviousClose": 0.47,
 *    "regularMarketSource": "DELAYED",
 *    "regularMarketOpen": 0.467,
 *    "exchange": "PAR",
 *    "exchangeName": "Paris",
 *    "marketState": "POSTPOST",
 *    "quoteType": "EQUITY",
 *    "symbol": "CLA.PA",
 *    "underlyingSymbol": null,
 *    "shortName": "CLARANOVA",
 *    "longName": "Claranova S.A.",
 *    "currency": "EUR",
 *    "currencySymbol": "€",
 *    "fromCurrency": null,
 *    "lastMarket": null,
 *     "marketCap": 177084496
 *   }
 * }
 */
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
              _.assign(item, info);
            }
            this.emitItem(item);
            this.unref();
          }
        );
      } catch (err) {
        debug('err:', err);
        this.error('something went wrong');
        this.emitItem(item);
        this.unref();
      }

    }
    else {
      this.emitItem(item);
    }
  }
}

module.exports = YFQuote;
