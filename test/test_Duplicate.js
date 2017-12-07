'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Duplicate', function() {

  it('duplicates an attribute', function(done) {
    var pipe = new pipo.Duplicate();

    pipe.on('item', (item) => {
      should(item).have.property('newName', 'value');
      should(item).have.property('oldName', 'value');
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
      should(item).have.property('sub').property('item2').eql(42);
      should(item).have.property('sub').property('item1').eql(42);
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
