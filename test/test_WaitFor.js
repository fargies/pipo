'use strict';

const
  assert = require('assert'),
  _ = require('lodash'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('WaitFor', function() {

  it('Wait for a property', function() {
    var pipe = new pipo.WaitFor();
    var count = 0;

    pipe.on('item', function() {
      count = count + 1;
    });
    pipe.onItem({ WaitForConfig: { property: "prop" } });
    pipe.onItem({ value: 42 });
    assert.equal(count, 0);
    pipe.onItem({ prop: 44 });
    assert.equal(count, 2);
    pipe.end(0);
  });

  it('Wait for a pattern', function() {
    var pipe = new pipo.WaitFor();
    var count = 0;

    pipe.on('item', function() {
      count = count + 1;
    });
    pipe.onItem({ WaitForConfig: { property: "prop", pattern: 'to.o' } });
    pipe.onItem({ prop: 42 });
    assert.equal(count, 0);
    pipe.onItem({ prop: 'toto' });
    assert.equal(count, 2);
    pipe.end(0);
  });
});
