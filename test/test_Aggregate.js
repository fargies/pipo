'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Aggregate', function() {

  it('aggregates messages', function(done) {
    var pipe = new pipo.Aggregate();

    pipe.on('item', (item) => {
      assert('items' in item);
      assert.equal(item.items.length, 2);
      assert.equal(item.items[0].item, 1);
      assert.equal(item.items[1].item, 2);
      done();
    });
    pipe.onItem({ "item" : 1 });
    pipe.onItem({ "item" : 2 });
    pipe.end(0);
  });

  it('aggregates properties', function(done) {
    var pipe = new pipo.Aggregate();

    pipe.on('item', (item) => {
      assert('val' in item);
      assert.equal(item.val.length, 2);
      assert.equal(item.val[0], 1);
      assert.equal(item.val[1], 2);
      done();
    });
    pipe.onItem({ "AggregateConfig" : { "property" : 'val' } });
    pipe.onItem({ "val" : 1 });
    pipe.onItem({ "val" : 2 });
    pipe.end(0);
  });

  it('aggregates sub properties', function(done) {
    var pipe = new pipo.Aggregate();

    pipe.on('item', (item) => {
      assert.deepEqual(item, { "value": [ 1, 2 ] });
      done();
    });
    pipe.onItem({ "AggregateConfig" : { "property" : 'val.value' } });
    pipe.onItem({ "val" : { "value": 1 } });
    pipe.onItem({ "val" : { "value": 2 } });
    pipe.end(0);
  });
});
