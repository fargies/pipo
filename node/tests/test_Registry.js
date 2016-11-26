'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Registry', function() {

  it('contains base items', function() {
    assert('StdIn' in pipo.Registry.pipes);
    assert('StdOut' in pipo.Registry.pipes);
    assert('SubPipe' in pipo.Registry.pipes);
  });
});
