'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('ReFilter', function() {

  it('filters messages', function(done) {
    var pipe = new pipo.ReFilter();
    var count = 0;

    pipe.on('item', (item) => {
      assert('name' in item);
      assert.equal(item.name, '1234');
      ++count;
    })
    .on('end', () => {
      assert.equal(count, 2);
      done();
    });
    pipe.setFilter({ name: '^[0-9]+$' });

    pipe.onItem({ "name" : 1234 });
    pipe.onItem({ "name" : 'a1234' });
    pipe.onItem({ "noname" : '1234' });
    pipe.onItem({ "name" : '1234' });
    pipe.end(0);
  });

  it('filters with options', function(done) {
    var pipe = new pipo.ReFilter();

    pipe.on('item', (item) => {
      assert('name' in item);
      assert.equal(item.name, '1234');
      done();
    });
    pipe.setFilter({ name: [ '^[0-9]+$', 'i' ] });

    pipe.onItem({ "name" : 1234 });
  });

  it('set an invalid configuration', function(done) {
    var pipe = new pipo.ReFilter();
    var count = 0;

    pipe.on('item', (item) => {
      assert('errorString' in item);
      ++count;
    })
    .on('end', () => {
      assert.equal(count, 2);
      done();
    });

    pipe.onItem({ "ReFilterConfig" : { "filter" : { "name" : "(42" } } });
    pipe.onItem({ "ReFilterConfig" : { "filter" : { "name" : "[42" } } });
    pipe.end(0);
  });
});
