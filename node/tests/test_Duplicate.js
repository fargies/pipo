'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

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
    pipe.onItem({ 'DuplicateConfig' : { 'property': 'oldName', 'newName': 'newName' } });
    pipe.onItem({ "oldName" : "value" });
    pipe.end(0);
  });
});
