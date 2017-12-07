'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('AltPipe', function() {

  it('create an AltPipe', function() {
    var pipe = new pipo.AltPipe();
    pipe.onItem({ "pipe": "StdOut|StdOut", "item": 42 });
    should(pipe).property('_pipe').length(2);
  });

  it('forwards messages', function(done) {
    var pipe = new pipo.AltPipe();
    var accu = new pipo.Aggregate();

    pipe.next(accu);
    pipe.onItem({ "pipe": "StdOut" });

    accu.on('item', (item) => {
      should(item).have.property('items')
      .eql([ { data: 42 }, { data: 42 } ]);
      done();
    });
    pipe.onItem({ "data" : 42 });
    pipe.end(0);
  });
});
