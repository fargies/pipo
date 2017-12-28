'use strict';

const
  _ = require('lodash'),
  debug = require('debug')('pipo:tests'),
  should = require('should'),
  lsof = require('lsof'),
  tmp = require('tmp'),
  q = require('q'),
  fs = require('fs'),
  Helpers = require('./Helpers'),
  { it, describe, beforeEach, afterEach } = require('mocha');

const
  pipo = require('../pipo');


describe('PouchDB', function() {
  var dir;

  beforeEach(function() {
    dir = tmp.dirSync({ unsafeCleanup: true });
    should.exist(dir);
    debug('tmpdir:', dir.name);
  });

  afterEach(function() {
    this.timeout(15000); /* leak test creates a lot of files */
    dir.removeCallback();
    dir = null;
  });

  it('insert an item in PouchDB', function(done) {
    var pipe = new pipo.PouchDBOut();

    pipe.on('end', () => {
      var inPipe = new pipo.SubPipe('PouchDBIn|Aggregate');
      inPipe.on('item', (item) => {
        should(item).have.property('items').length(1);
        should(item).get('items[0]')
        .containEql({ value: '1234', '_id': '42', id: { name: 42 } });
        done();
      });

      inPipe.onItem({ 'PouchDBInConfig': { 'database' : dir.name } });
      inPipe.onItem({ 'selector': {} });
    });

    pipe.onItem({ 'PouchDBOutConfig': { 'database': dir.name, 'itemId': 'id.name' } });
    pipe.onItem({ 'id': { 'name': 42 }, 'value': '1234' });
  });

  it('search an item in PouchDB', function(done) {
    var outPipe = new pipo.PouchDBOut();
    var pipe = new pipo.SubPipe('PouchDBIn|Aggregate');
    pipe.ref();

    pipe.on('item', _.defer.bind(null, (item) => {
      should(item).have.property('items');
      should(item.items).length(3);
      should(item.items[0]).containEql({ date: 1239 });
      should(item.items[1]).containEql({ date: 1238 });
      should(item.items[2]).containEql({ date: 1237 });
      done();
    }));

    outPipe.onItem({
      'PouchDBOutConfig': { 'database': dir.name, 'itemId': 'id' }
    });
    pipe.onItem({ 'PouchDBInConfig': { 'database': dir.name } });

    outPipe.on('end', () => {
      pipe.onItem({
        'selector': { 'date': { '$gte': 1237 }},
        'sort': [ { 'date': 'desc' } ],
        'createIndex': { 'fields': [ 'date' ], 'name': 'dateIndex' }
      });
      pipe.end(0);
    });

    _.forEach([
      { 'id': 1, 'date': 1234 },
      { 'id': 2, 'date': 1235 },
      { 'id': 3, 'date': 1236 },
      { 'id': 4, 'date': 1237 },
      { 'id': 5, 'date': 1238 },
      { 'id': 6, 'date': 1239 }
    ], (elt) => { outPipe.onItem(elt); });
  });

  function lsofPromise() {
    var def = q.defer();
    lsof.counters(function(data) { def.resolve(data); });
    return def.promise;
  }

  // indexs used to leak files, ending in too many files open
  it('does not leak when using views', function(done) {
    var def = q.defer();
    fs.mkdirSync(dir.name + '/1');
    var temp = new pipo.PouchDBIn();
    temp.onItem({
      PouchDBInConfig: { database: dir.name + '/1' },
      selector: {},
      createIndex: { fields: [ "date" ], name: "dateIndex" }
    }); /* not really useful, but we will load plugins in PouchDB */
    temp.once('end', def.resolve.bind(def));

    def.promise
    .then(lsofPromise)
    .then(function(refLsof) {
      var pipe = new pipo.PouchDBIn();
      pipe.once('end', function() {
        lsofPromise()
        .then(function(lsof) {
          should(refLsof.open).eql(lsof.open);
          done();
        })
        .done();
      });
      pipe.onItem({
        PouchDBInConfig: { database: dir.name },
        selector: {},
        createIndex: { fields: [ "date" ], name: "dateIndex" }
      });
    });
  });
});
