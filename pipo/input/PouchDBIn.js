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
  q = require('q'),
  PouchDB = require('pouchdb'),
  debug = require('debug')('pipo:pouchdb:in'),
  PipeElement = require('../PipeElement');

PouchDB.plugin(require('pouchdb-find'));

const opts = [ 'selector', 'fields', 'sort', 'limit', 'skip', 'use_index' ];

class PouchDBIn extends PipeElement {
  constructor() {
    super();
    this.database = null;
  }

  _openDB(database) {
    this.ref();
    if (_.isNil(database)) {
      return q.reject('Database not set');
    }
    else {
      return q(new PouchDB(database));
    }
  }

  static _closeDB(db) {
    debug('closing');
    return db.close()
    .then(function() {
      return q.allSettled(
        _.map(db._cachedViews, function(cache) {
          return cache.then(function(view) { return view.db.close(); });
        })
      )
      .thenResolve(db);
    });
  }

  static _indexCreate(item, db) {
    if (!_.has(item, 'createIndex')) {
      return db;
    }

    var idx = _.assign({ ddoc: 'ddoc' }, item.createIndex);
    delete item.createIndex;

    return db.createIndex({ index: idx })
    .then(function() { return db; });
  }

  static _indexDelete(item, db) {
    if (!_.has(item, 'deleteIndex')) {
      return db;
    }

    var idx = _.assign({ ddoc: '_design/ddoc' }, item.deleteIndex);
    delete item.deleteIndex;
    if (!_.startsWith(idx.ddoc, '_design/')) {
      idx.ddoc = '_design/' + idx.ddoc;
    }

    return db.deleteIndex(idx)
    .then(function() { return db; });
  }

  onItem(item) {
    super.onItem(item);
    var prom;
    var dbHdlr;

    if (_.has(item, 'createIndex')) {
      prom = this._openDB(this.database)
      .then(function(db) { dbHdlr = db; return db; })
      .then(PouchDBIn._indexCreate.bind(null, item));
    }
    if (_.has(item, 'selector')) {
      prom = (prom || this._openDB(this.database))
      .then((db) => {
        dbHdlr = db;
        return db.find(_.pick(item, opts))
        .then((ret) => {
          debug('found:', ret);
          _.forEach(ret.docs, (doc) => { this.emit('item', doc); });
          item = _.omit(item, opts);
          return db;
        });
      });
    }
    if (_.has(item, 'deleteIndex')) {
      prom = (prom || this._openDB(this.database))
      .then(function(db) { dbHdlr = db; return db; })
      .then(PouchDBIn._indexDelete.bind(null, item));
    }
    if (!_.isNil(prom)) {
      prom = prom
      .then(
        () => { this.emitItem(item); },
        (e) => { this.error(_.toString(e)); }
      )
      .then(() => {
        if (dbHdlr) {
          PouchDBIn._closeDB(dbHdlr)
          .then(this.unref.bind(this));
        }
        else {
          this.unref();
        }
      });
    }
    else if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = PouchDBIn;
