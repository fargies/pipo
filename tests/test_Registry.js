'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('Registry', function() {

  it('contains base items', function() {
    assert('StdIn' in pipo.Registry.pipes);
    assert('StdOut' in pipo.Registry.pipes);
    assert('SubPipe' in pipo.Registry.pipes);
  });

  it('add/remove pipelines', function() {
    pipo.Registry.add({ 'toto' : pipo.Rename });
    assert.equal(pipo.Registry.get('toto'), pipo.Rename);

    pipo.Registry.remove('toto');
    assert(_.isNil(pipo.Registry.get('toto')));
  });
});
