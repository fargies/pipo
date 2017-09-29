'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Rename', function() {

  it('renames a property', function(done) {
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

  it('renames a sub property', function(done) {
    var pipe = new pipo.Rename();

    pipe.on('item', (item) => {
      assert.deepEqual(item, { "old": {}, "new": { "toto": 42 } });
      done();
    });
    pipe.onItem({ 'RenameConfig' : { 'property': 'old.name', 'newName': 'new.toto' } });
    pipe.onItem({ "old": { "name": 42 } });
    pipe.end(0);
  });
});
