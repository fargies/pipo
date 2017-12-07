'use strict';

const
  should = require('should'),
  _ = require('lodash'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('SubPipe', function() {

  it('create a subpipe', function() {
    var pipe = new pipo.SubPipe();
    pipe.onItem({ "pipe": "StdOut|StdOut" });
    pipe.onItem({ "item": 42 });
    should(pipe).have.property('_pipe').length(2);
  });

  it('forwards messages when no pipe set', function(done) {
    var pipe = new pipo.SubPipe();
    pipe.on('item', function() {
      done();
    });
    pipe.onItem({ 'item': 1 });
  });

  it('forwards messages', function(done) {
    var pipe = new pipo.SubPipe();
    pipe.onItem({ "pipe": "Aggregate" });

    pipe.on('item', (item) => {
      should(item).have.property('items')
      .eql([ { item: 1 }, { item: 2} ]);
      done();
    });
    pipe.onItem({ "item" : 1 });
    pipe.onItem({ "item" : 2 });
  });

  it('sends config to the subPipe', function(done) {
    var pipe = new pipo.SubPipe();

    pipe.on('item', function(item) {
      should(item).have.property('new').eql(42);
      done();
    });
    pipe.onItem({
      'pipe': 'Rename',
      'RenameConfig': {
        'property': 'item',
        'newName': 'new'
      },
      'item': 42
    });
  });

  it('fails on unknown pipe element', function(done) {
    var pipe = new pipo.SubPipe();

    pipe.on('item', (item) => {
      should(item).have.property('errorString');
      done();
    });
    pipe.onItem({ "pipe": "Unknown", "item": 42 });
  });

  it('handles multiple pipes', function(done) {
    var pipe = new pipo.SubPipe();
    var count = 0;

    pipe.ref();
    pipe.on('item', function(item) {
      should(item).have.property('items')
      .eql([ { item: 42 } ]);
      count = count + 1;
    });
    pipe.on('end', (status) => {
      should(status).eql(0);
      should(count).eql(2);
      done();
    });

    pipe.onItem({ 'pipe': [ 'Aggregate', 'Aggregate' ] });
    pipe.onItem({ "item": 42 });
    pipe.end(0);
  });

  it('handles object pipes', function(done) {
    var pipe = new pipo.SubPipe();
    var accu = new pipo.Aggregate();

    pipe.next(accu);
    accu.on('item', function(item) {
      should(item).have.property('items')
      .containDeep([ { empty: true }, { new: 42 }, { item: 42 } ])
      .length(3);
      done();
    });

    pipe.onItem({ 'pipe': [
      {
        'pipe': 'Rename',
        'RenameConfig': {
          'property': 'item',
          'newName': 'new'
        }
      },
      { 'empty': true }
    ]});
    pipe.onItem({ 'item': 42 });
    pipe.end(0);
  });

  it('handles oneShot pipes', function(done) {
    var pipe = new pipo.SubPipe();

    pipe.on('item', function(item) {
      should(item).have.property('items')
      .eql([ { item: 42 } ]);
      done();
    });
    pipe.onItem({
      'SubPipeConfig': {
        'pipe': 'Aggregate',
        'oneShot': true
      },
      'item': 42
    });
  });
});
