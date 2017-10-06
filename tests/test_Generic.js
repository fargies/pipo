'use strict';

const
  assert = require('assert'),
  {describe, it} = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('Generic', function() {

  _.forEach(_.keys(pipo.Registry.pipes), function(elt) {
    if (_.includes([ 'StdIn' ], elt)) {
      return;
    }

    it(`unconnected ${elt} terminates`, function(done) {
      let Elt = pipo[elt];
      assert.ok(!_.isNil(Elt));
      assert.ok(Elt.prototype instanceof pipo.PipeElement);

      var pipe = new Elt();
      pipe.on('end', function() {
        done();
      });
      pipe.start();
    });

    it(`${elt} drops empty items`, function(done) {
      let Elt = pipo[elt];
      let count = 0;
      assert.ok(!_.isNil(Elt));
      assert.ok(Elt.prototype instanceof pipo.PipeElement);

      var pipe = new Elt();
      pipe.on('item', function() {
        count = count + 1;
      });
      pipe.on('end', function() {
        assert.equal(count, 0);
        done();
      });
      pipe.onItem({}); /* send an empty item */
    });

    it(`configuration passes through ${elt}`, function(done) {
      let Elt = pipo[elt];
      assert.ok(!_.isNil(Elt));
      assert.ok(Elt.prototype instanceof pipo.PipeElement);

      var pipe = new Elt();
      pipe.on('item', function(item) {
        assert.ok('TestConfig' in item);
        done();
      });
      pipe.onItem({ 'TestConfig': { 'toto': 42 } });
      /* signal must have been already processed now */
      pipe.removeAllListeners('item');
    });

  });
});
