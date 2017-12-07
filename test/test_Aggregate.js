'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Aggregate', function() {

  it('aggregates messages', function(done) {
    var pipe = new pipo.Aggregate();

    pipe.on('item', (item) => {
      should(item).have.property('items')
      .eql([ { item: 1 }, { item: 2 } ]);
      done();
    });
    pipe.onItem({ "item" : 1 });
    pipe.onItem({ "item" : 2 });
    pipe.end(0);
  });

  it('aggregates properties', function(done) {
    var pipe = new pipo.Aggregate();

    pipe.on('item', (item) => {
      should(item).have.property('val')
      .eql([ 1, 2 ]);
      done();
    });
    pipe.onItem({ "AggregateConfig" : { "property" : 'val' } });
    pipe.onItem({ "val" : 1 });
    pipe.onItem({ "val" : 2 });
    pipe.end(0);
  });

  it('aggregates sub properties', function(done) {
    var pipe = new pipo.Aggregate();

    pipe.on('item', (item) => {
      should(item).have.property('value')
      .eql([ 1, 2 ]);
      done();
    });
    pipe.onItem({ "AggregateConfig" : { "property" : 'val.value' } });
    pipe.onItem({ "val" : { "value": 1 } });
    pipe.onItem({ "val" : { "value": 2 } });
    pipe.end(0);
  });
});
