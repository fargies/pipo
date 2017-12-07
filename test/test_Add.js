'use strict';

const
  should = require('./should-ext'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');

describe('Add', function() {

  it('adds a property', function(done) {
    var pipe = new pipo.Add();

    pipe.on('item', function(item) {
      should(item).not.have.property('toto.titi[0].tata');
      should(item).get('toto.titi[0].tata').eql(42);
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
