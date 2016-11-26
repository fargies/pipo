'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('SubPipe', function() {

  it('create a subpipe', function() {
    var pipe = new pipo.SubPipe();
    pipe.onItem({ "pipe": "StdOut|StdOut" });
    assert.equal(pipe.pipe.length, 2);
  });

  it('forwards messages', function(done) {
    var pipe = new pipo.SubPipe();
    pipe.onItem({ "pipe": "Aggregate" });

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

  it('fails on unknown pipe element', function(done) {
    var pipe = new pipo.SubPipe();

    pipe.on('item', (item) => {
      assert('errorString' in item);
      done();
    });
    pipe.onItem({ "pipe": "Unknown" });
  });
});
