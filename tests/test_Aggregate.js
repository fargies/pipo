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
});
