'use strict';

const
  assert = require('assert'),
  {describe, it} = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('Generic', function() {

  _.forEach(_.keys(pipo.Registry.pipes), function(pipe) {
    if (_.includes([ 'StdIn' ], pipe)) {
      return;
    }

    it(`unconnected ${pipe} terminates`, function(done) {
      let Elt = pipo[pipe];
      assert.ok(!_.isNil(Elt));
      assert.ok(Elt.prototype instanceof pipo.PipeElement);

      pipe = new Elt();
      pipe.on('end', function() {
        done();
      });
      pipe.start();
    });
  });

});
