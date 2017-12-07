'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  pipo = require('../pipo');


describe('SerialPipe', function() {

  it('forwards messages when no pipe set', function(done) {
    var pipe = new pipo.SerialPipe();
    pipe.on('item', function() {
      done();
    });
    pipe.onItem({ 'item': 1 });
  });

  it('serializes items', function(done) {
    var pipe = new pipo.SerialPipe();
    var count = 0;

    pipe.on('item', function() {
      count = count + 1;
    });
    pipe.on('end', function() {
      should(count).eql(2);
      done();
    });
    pipe.onItem({
      SerialPipeConfig: {
        pipe: 'StdOut'
      }
    });
    pipe.onItem({ 'item': 42 });
    pipe.onItem({ 'item': 42 });
  });

  it('waits for sub-pipe to end', function() {
    var pipe = new pipo.SerialPipe();
    var count = 0;

    pipe.on('item', function() {
      count = count + 1;
    });
    pipe.onItem({
      SerialPipeConfig: {
        pipe: {
          pipe: 'WaitFor',
          WaitForConfig: {
            property: 'notItem'
          }
        }
      }
    });
    pipe.onItem({ 'item': 42 });
    pipe.onItem({ 'item': 42 });
    should(count).eql(0);
  });
});
