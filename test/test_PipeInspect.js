'use strict';

const
  assert = require('assert'),
  { describe, it, beforeEach, afterEach } = require('mocha');

const
  pipo = require('../pipo'),
  PipeInspect = require('../pipo/utils/PipeInspect');


describe('Inspect', function() {
  var inspect;

  beforeEach(function() {
    inspect = new PipeInspect();
  });
  afterEach(function() {
    inspect.unhook();
  });

  it('collects created Pipes', function(done) {
    var add;

    inspect.once('new', function(item) {
      assert.equal(item.elt, add);
      inspect.unhook();
      done();
    });
    add = new pipo.Add();
  });

  it('events connections', function(done) {
    var add = new pipo.Add();
    var out = new pipo.StdOut();

    var addElt = inspect.get(add);
    assert.ok(addElt);
    addElt.once('next', function(next) {
      assert.equal(next.elt, out);
      assert.deepEqual(addElt.next, [ inspect.uid(out) ]);
      inspect.unhook();
      done();
    });
    add.next(out);
  });

  it('events outgoing items', function(done) {
    var add = new pipo.Add();

    var addElt = inspect.get(add);
    addElt.once('item', function(item) {
      assert.deepEqual(item, { test: 42 });
      done();
    });
    add.onItem({ test: 42 });
  });

  it('events incoming items', function(done) {
    var add = new pipo.Add();

    inspect.get(add).once('onItem', function(item) {
      assert.deepEqual(item, { test: 42 });
      done();
    });
    add.onItem({ test: 42 });
  });

  it('events pipe end', function(done) {
    var add = new pipo.Add();

    inspect.get(add).once('end', function() {
      done();
    });
    add.onItem({ test: 42 });
  });

  it('events sub-pipes', function(done) {
    var sub = new pipo.SubPipe();

    var subElt = inspect.get(sub);
    subElt.once('sub', function(elt) {
      assert.ok(elt.elt instanceof pipo.Add);
      assert.deepEqual(subElt.sub, [ elt.id ]);
      done();
    });
    sub.setPipe('Add|Rename');
    sub.onItem({ test: 42 });
  });
});
