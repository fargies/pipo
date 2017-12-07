'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('ReFilter', function() {

  it('filters messages', function(done) {
    var pipe = new pipo.ReFilter();
    var count = 0;

    pipe.on('item', (item) => {
      should(item).have.property('name').oneOf(1234, '1234');
      ++count;
    })
    .on('end', () => {
      should(count).eql(2);
      done();
    });
    pipe.onItem({
      'ReFilterConfig': {
        'property': 'name',
        'pattern': '^[0-9]+$'
      }
    });

    pipe.onItem({ "name" : 1234 });
    pipe.onItem({ "name" : 'a1234' });
    pipe.onItem({ "noname" : '1234' });
    pipe.onItem({ "name" : '1234' });
    pipe.end(0);
  });

  it('filters with options', function(done) {
    var pipe = new pipo.ReFilter();

    pipe.on('item', (item) => {
      should(item).have.property('name').eql(1234);
      done();
    });
    pipe.onItem({
      'ReFilterConfig': {
        'property': 'name',
        'pattern': '^[0-9]+$'
      }
    });

    pipe.onItem({ "name" : 1234 });
  });

  it('set an invalid configuration', function(done) {
    var pipe = new pipo.ReFilter();
    var count = 0;

    pipe.on('item', (item) => {
      should(item).have.property('errorString');
      ++count;
    })
    .on('end', () => {
      should(count).eql(2);
      done();
    });

    pipe.onItem({ "ReFilterConfig" : { "pattern" : "(42" } });
    pipe.onItem({ "ReFilterConfig" : { "pattern" : "[42" } });
    pipe.end(0);
  });
});
