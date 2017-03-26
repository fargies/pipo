'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Rename', function() {

  it('renames an attribute', function(done) {
    var pipe = new pipo.Rename();

    pipe.on('item', (item) => {
      assert('newName' in item);
      assert(!('oldName' in item));
      assert.equal(item.newName, "value");
      done();
    });
    pipe.onItem({ 'RenameConfig' : { 'property': 'oldName', 'newName': 'newName' } });
    pipe.onItem({ "oldName" : "value" });
    pipe.end(0);
  });
});
