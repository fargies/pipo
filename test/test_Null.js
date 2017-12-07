'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Null', function() {

  it('filters messages', function(done) {
    var pipe = new pipo.Null();
    var count = 0;

    pipe.on('item', (item) => {
      count++;
      should(item).have.property('errorString');
    });
    pipe.on('end', () => {
      should(count).eql(1);
      done();
    });
    pipe.onItem({ "item" : 1 });
    pipe.onItem({ "item" : 2 });
    pipe.onItem({ "errorString" : "big error" });

    pipe.onItem({ "NullConfig" : { "errorOnly" : false } });
    pipe.onItem({ "errorString" : "big error" });

    pipe.end(0);
  });
});
