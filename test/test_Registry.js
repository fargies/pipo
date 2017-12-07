'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Registry', function() {

  it('contains base items', function() {
    should(pipo).get('Registry.pipes')
    .properties([ 'StdIn', 'StdOut', 'SubPipe' ]);
  });

  it('add/remove pipelines', function() {
    pipo.Registry.add({ 'toto' : pipo.Rename });
    should(pipo.Registry.get('toto')).eql(pipo.Rename);

    pipo.Registry.remove('toto');
    should.not.exist(pipo.Registry.get('toto'));
  });
});
