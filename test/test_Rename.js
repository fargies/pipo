'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('Rename', function() {

  it('renames a property', function(done) {
    var pipe = new pipo.Rename();

    pipe.on('item', (item) => {
      should(item).have.property('newName').eql('value');
      should(item).not.have.property('oldName');
      done();
    });
    pipe.onItem({ 'RenameConfig' : { 'property': 'oldName', 'newName': 'newName' } });
    pipe.onItem({ "oldName" : "value" });
    pipe.end(0);
  });

  it('renames a sub property', function(done) {
    var pipe = new pipo.Rename();

    pipe.on('item', (item) => {
      should(item).eql({ "old": {}, "new": { "toto": 42 } });
      done();
    });
    pipe.onItem({ 'RenameConfig' : { 'property': 'old.name', 'newName': 'new.toto' } });
    pipe.onItem({ "old": { "name": 42 } });
    pipe.end(0);
  });
});
