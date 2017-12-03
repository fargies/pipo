'use strict';

const
  assert = require('assert'),
  {describe, it} = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('pipo', function() {

  it('contains base items', function() {
    assert.ok('StdIn' in pipo);
    assert.ok('StdOut' in pipo);
    assert.ok('SubPipe' in pipo);

    assert.ok(pipo.StdIn.prototype instanceof pipo.PipeElement);
  });
});
