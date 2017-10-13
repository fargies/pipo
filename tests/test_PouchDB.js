'use strict';

const
  _ = require('lodash'),
  debug = require('debug')('pipo:tests'),
  assert = require('assert'),
  tmp = require('tmp'),
  fs = require('fs'),
  Helpers = require('./Helpers'),
  { it, describe, beforeEach, afterEach } = require('mocha');

const
  pipo = require('../pipo');


describe('PouchDB', function() {
  var dir;

  beforeEach(function() {
    dir = tmp.dirSync({ unsafeCleanup: true });
    assert.ok(dir);
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
        assert.equal(_.size(item.items), 1);
        assert.equal(item.items[0].value, '1234');
        assert.equal(item.items[0]._id, '42');
        assert.equal(item.items[0].id, 42);
        done();
      });

      inPipe.onItem({ 'PouchDBInConfig': { 'database' : dir.name } });
      inPipe.onItem({ 'selector': {} });
    });

    pipe.onItem({ 'PouchDBOutConfig': { 'database': dir.name, 'itemId': 'id' } });
    pipe.onItem({ 'id': 42, 'value': '1234' });
  });

  it('search an item in PouchDB', function(done) {
    var outPipe = new pipo.PouchDBOut();
    var pipe = new pipo.SubPipe('PouchDBIn|Aggregate');
    pipe.ref();

    pipe.on('item', Helpers.defer((item) => {
      assert.equal(_.size(item.items), 3);
      assert.equal(item.items[0].date, 1239);
      assert.equal(item.items[1].date, 1238);
      assert.equal(item.items[2].date, 1237);
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

  // indexs used to leak files, ending in too many files open
  it('does not leak when using views', function(done) {
    this.timeout(50000);

    var count = 0;
    var pipe = new pipo.SerialPipe();
    pipe.ref();
    pipe.onItem({
      SerialPipeConfig: {
        pipe: "PouchDBIn"
      }
    });
    for (var i = 0; i < 5000; ++i) {
      fs.mkdirSync(dir.name + '/' + i);
      pipe.onItem({
        PouchDBInConfig: {
          database: dir.name + '/' + i
        },
        selector: {},
        createIndex: { fields: [ "date" ], name: "dateIndex" }
      });
    }
    pipe.on('item', () => { count = count + 1; });
    pipe.once('end', () => {
      assert.equal(count, 0);
      done();
    });
    pipe.end(0);

  });
});
