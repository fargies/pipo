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
** Created on: 2016-11-29T09:17:15+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  xmldom = require('xmldom'),
  xpath = require('xpath'),
  _ = require('lodash'),
  debug = require('debug')('pipo:filter'),
  PipeElement = require('../PipeElement'),
  Item = require('../Item');

class XQuery extends PipeElement {
  constructor() {
    super();
    this.trim = false;
    this.subQueries = null;
    this.query = null;
  }

  onItem(item) {
    super.onItem(item);

    if ('xml' in item) {
      let query = Item.take(item, 'query', this.query);
      let subQueries = _.clone(Item.take(item, 'subQueries', this.subQueries));
      let xml = Item.take(item, 'xml');

      try {
        _.forOwn(subQueries, function(value, key) {
          if (!value.startsWith('./')) {
            subQueries[key] = xpath.parse('./' + value);
          } else {
            subQueries[key] = xpath.parse(value);
          }
        });

        if (!query || !subQueries) {
          throw "\"query\" and \"subQueries\" are required in XQuery elements";
        }
        let doc = new xmldom.DOMParser().parseFromString(xml);
        let nodes = xpath.select(query, doc);

        debug('%i nodes selected %o', nodes.length, nodes);
        _.forIn(nodes, (node) => {
          let out = _.cloneDeep(item);
          _.forOwn(subQueries, (value, key) => {
            let ret = value.evaluateString({ node: node });
            out[key] = (this.trim) ? _.trim(ret) : ret;
          });
          this.emit('item', out); // FIXME: seems to be directly connected to callback
        });
      } catch (e) {
        this.error(e.toString());
        return;
      }
    } else if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = XQuery;
