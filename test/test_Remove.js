'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Remove', function() {

  it('removes an attribute', function(done) {
    var pipe = new pipo.Remove();

    pipe.on('item', (item) => {
      should(item).not.have.property('oldName');
      should(item).have.property('test').eql(42);
      done();
    });
    pipe.onItem({ 'RemoveConfig' : { 'property': 'oldName' } });
    pipe.onItem({ "oldName" : "value", "test": 42 });
    pipe.end(0);
  });

  it('removes a sub property', function(done) {
    var pipe = new pipo.Remove();
    pipe.on('item', (item) => {
      should(item).eql({ "oldName": { "toto": 43 } });
      done();
    });
    pipe.onItem({ 'RemoveConfig' : { 'property': 'oldName.name' } });
    pipe.onItem({ "oldName" : { "name" : 42, "toto": 43 } });
    pipe.end(0);
  });
});
