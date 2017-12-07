'use strict';

const
  should = require('should'),
  {describe, it} = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('Replace', function() {
  it('replace an attribute using a regular expression', function(done) {
    var pipe = new pipo.Replace();

    pipe.on('item', (item) => {
      should(item).have.property('name').eql('ee');
      done();
    });
    pipe.onItem({ 'ReplaceConfig':
      { 'property': 'name', 'pattern': [ 'Va.[u]', 'i' ], 'newSubstr': 'e' } });
    pipe.onItem({ "name": "value" });
    pipe.end(0);
  });

  it('replace a sub-attribute', function(done) {
    var pipe = new pipo.Replace();

    pipe.on('item', (item) => {
      should(item).have.property('sub')
      .property('name').eql('ee');
      done();
    });
    pipe.onItem({
      ReplaceConfig: {
        property: 'sub.name',
        pattern: '^',
        newSubstr: 'e'
      }
    });
    pipe.onItem({ sub: { name: 'e' } });
  });
});
