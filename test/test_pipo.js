'use strict';

const
  should = require('should'),
  {describe, it} = require('mocha');

const
  pipo = require('../pipo');


describe('pipo', function() {

  it('contains base items', function() {
    should(pipo).have.properties([ 'StdIn', 'StdOut', 'SubPipe' ]);

    should(pipo.StdIn.prototype).instanceof(pipo.PipeElement);
  });
});
