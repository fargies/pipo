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
** Created on: 2016-11-05T18:01:36+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash');

const
  PipeElement = require('./PipeElement');

/**
 * @module Aggregate
 * @description Aggregates items or properties
 *
 * ### Configuration
 *
 * | Name     | Type       | Default | Description                 |
 * | :------- | :--------- | :------ | :-------------------------- |
 * | [`property`] | string | null    | The properties to aggregate |
 *
 * ### Items
 * Whenever *property* is set this property will be aggregated from incoming
 * items, incoming items (even those which don't have the propety)
 * are not passing through, an item with *property* containing all aggregated
 * items is sent when pipe is ended.
 *
 * If *property* is null incoming items are aggregated, and an item with
 * *items* property containing all aggregated items is sent when pipe is ended.
 *
 * @example
 * // Aggregating items
 * {
 *   "pipe": "Aggregate"
 * }
 * { "test": 42 }{ "titi" : 44 }
 * ===
 * {
 *   "items": [
 *       { "test": 42 },
 *       { "titi": 44 }
 *   ]
 * }
 *
 * @example
 * // Aggregating properties
 * {
 *   "pipe": "Aggregate"
 *   "AggregateConfig": { "property": "test" }
 * }
 * { "test": 42 }
 * { "toto": 44 }
 * { "test": 45 }
 * ===
 * {
 *   "test": [ 42, 45 ]
 * }
 */
class Aggregate extends PipeElement {
  constructor() {
    super();
    this._items = [];
    this.property = null;
  }

  onItem(item) {
    super.onItem(item);

    if (!_.isEmpty(item)) {
      if (_.isNil(this.property)) {
        this._items.push(item);
      } else if (_.has(item, this.property)) {
        this._items.push(_.get(item, this.property));
      }
    }
  }

  end(status) {
    if ((this._ref === 1) && (this._items.length !== 0)) {
      if (_.isNil(this.property)) {
        this.emit('item', { items: this._items });
      } else {
        this.emit('item', { [_.last(_.toPath(this.property))]: this._items });
      }
    }
    super.end(status);
  }
}

module.exports = Aggregate;
