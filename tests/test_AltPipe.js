'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('AltPipe', function() {

  it('create an AltPipe', function() {
    var pipe = new pipo.AltPipe();
    pipe.onItem({ "pipe": "StdOut|StdOut" });
    assert.equal(pipe.pipe.length, 2);
  });

  it('forwards messages', function(done) {
    var pipe = new pipo.AltPipe();
    var accu = new pipo.Aggregate();

    pipe.next(accu);
    pipe.onItem({ "pipe": "StdOut" });

    accu.on('item', (item) => {
      assert('items' in item);
      assert.equal(item.items.length, 2);
      assert.equal(item.items[0].data, 42);
      assert.equal(item.items[1].data, 42);
      done();
    });
    pipe.onItem({ "data" : 42 });
    pipe.end(0);
  });
});
