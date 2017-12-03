'use strict';

const
  assert = require('assert'),
  _ = require('lodash'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Add', function() {

  it('adds a property', function(done) {
    var pipe = new pipo.Add();

    pipe.on('item', function(item) {
      assert.ok(_.has(item, [ 'toto', 'titi', '0', 'tata' ]));
      assert.equal(item.toto.titi[0].tata, 42);
      done();
    });
    pipe.onItem({
      "AddConfig": {
        "property": "toto.titi[0].tata",
        "value": 42
      },
      "item": 42
    });
  });
});
