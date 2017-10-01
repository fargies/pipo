'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('Duplicate', function() {

  it('duplicates an attribute', function(done) {
    var pipe = new pipo.Duplicate();

    pipe.on('item', (item) => {
      assert('newName' in item);
      assert('oldName' in item);
      assert.equal(item.newName, "value");
      assert.equal(item.oldName, "value");
      done();
    });
    pipe.onItem({ DuplicateConfig: {
      property: 'oldName',
      newName: 'newName' }
    });
    pipe.onItem({ "oldName" : "value" });
    pipe.end(0);
  });

  it('duplicates sub-attributes', function(done) {
    var pipe = new pipo.Duplicate();

    pipe.on('item', (item) => {
      assert.equal(_.get(item, [ "sub", "item2" ]), 42);
      assert.equal(_.get(item, [ "sub", "item1" ]), 42);
      done();
    });
    pipe.onItem({
      DuplicateConfig: {
        property: 'sub.item1',
        newName: 'sub.item2'
      }
    });
    pipe.onItem({ sub: { item1: 42 } });
  });
});
