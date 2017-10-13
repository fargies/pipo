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
** Created on: 2017-09-13T22:09:29+02:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/


const
  _ = require('lodash'),
  PouchDB = require('pouchdb'),
  q = require('q'),
  debug = require('debug')('pipo:pouchdb:out'),
  PouchDBIn = require('../input/PouchDBIn'),
  PipeElement = require('../PipeElement');

PouchDB.plugin(require('pouchdb-find'));

class PouchDBOut extends PipeElement {
  constructor() {
    super();
    this.database = null;
    this.itemId = null;
  }

  setDatabase(database) {
    if (this.database === database) {
      return;
    }
    this.database = database;
    if (this._db) {
      PouchDBIn._closeDB(this._db);
    }
    else {
      this.ref();
    }
    this._db = new PouchDB(database);
  }

  _checkDB() {
    this.ref();
    if (_.isNil(this._db)) {
      return q.reject('Database not set');
    }
    else {
      return q(this._db);
    }
  }

  onItem(item) {
    super.onItem(item);
    var prom;
    var itemId = _.defaultTo(this.itemId, '_id');

    if (_.has(item, 'createIndex')) {
      prom = this._checkDB()
      .then(PouchDBIn._indexCreate.bind(null, item));
    }
    if (_.has(item, itemId)) {
      prom = (prom || this._checkDB())
      .then((db) => {
        var id = _.toString(item[itemId]);
        return db.get(id)
        .then(
          (old) => { return { _rev: old._rev, _id: id }; },
          (err) => {
            if (err.status === 404) {
              return { _id: id };
            }
            else {
              throw err;
            }
          }
        )
        .then(
          (r) => { return db.put(_.assign(r, item)); }
        )
        .then(function() { debug('inserted', item[itemId]); });
      });
    }
    if (_.has(item, 'deleteIndex')) {
      prom = (prom || this._checkDB())
      .then(PouchDBIn._indexDelete.bind(null, item));
    }
    if (!_.isNil(prom)) {
      prom = prom
      .then(
        () => {
          if (!_.isEmpty(item)) { this.emit('item', item); }
          this.unref();
        },
        (e) => {
          this.error(_.toString(e));
          this.unref();
        }
      );
    }
    else if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }

  unref() {
    super.unref();
    if ((this._ref === 1) && !_.isNil(this._db)) {
      PouchDBIn._closeDB(this._db)
      .then(this.unref.bind(this));
    }
  }
}

module.exports = PouchDBOut;
