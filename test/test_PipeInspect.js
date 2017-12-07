'use strict';

const
  should = require('should'),
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
      should(item).have.property('elt').eql(add);
      inspect.unhook();
      done();
    });
    add = new pipo.Add();
  });

  it('events connections', function(done) {
    var add = new pipo.Add();
    var out = new pipo.StdOut();

    var addElt = inspect.get(add);
    should.exist(addElt);
    addElt.once('next', function(next) {
      should(next).have.property('elt').eql(out);
      should(addElt).have.property('next').eql([ inspect.uid(out) ]);
      inspect.unhook();
      done();
    });
    add.next(out);
  });

  it('events outgoing items', function(done) {
    var add = new pipo.Add();

    var addElt = inspect.get(add);
    addElt.once('item', function(item) {
      should(item).eql({ test: 42 });
      done();
    });
    add.onItem({ test: 42 });
  });

  it('events incoming items', function(done) {
    var add = new pipo.Add();

    inspect.get(add).once('onItem', function(item) {
      should(item).eql({ test: 42 });
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
      should(elt.elt).instanceOf(pipo.Add);
      should(subElt.sub).eql([ elt.id ]);
      done();
    });
    sub.setPipe('Add|Rename');
    sub.onItem({ test: 42 });
  });
});
