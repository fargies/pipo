'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Remove', function() {

  it('removes an attribute', function(done) {
    var pipe = new pipo.Remove();

    pipe.on('item', (item) => {
      assert(!('oldName' in item));
      assert.equal(item.test, 42);
      done();
    });
    pipe.onItem({ 'RemoveConfig' : { 'property': 'oldName' } });
    pipe.onItem({ "oldName" : "value", "test": 42 });
    pipe.end(0);
  });
});
