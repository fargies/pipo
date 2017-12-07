'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  PipeElement = require('../pipo/PipeElement');

describe('PipeElement', function() {
  it('itemOut', function(done) {
    var pipe = new PipeElement();
    pipe.once("item", (item) => {
      should(item).have.property('data').eql(42);
      done();
    });
    pipe.emit('item', { "data" : 42 });
  });

  it('next func', function(done) {
    var pipe = new PipeElement();
    pipe.next((item) => {
      should(item).have.property('data').eql(42);
      pipe.removeAllListeners();
      done();
    });
    pipe.emit('item', { "data" : 42 });
  });

  it('next pipeElement', function(done) {
    var pipe = new PipeElement();
    let item = new PipeElement();
    item.onItem = function(item) {
        should(item).have.property('data').eql(42);
        pipe.removeAllListeners();
        done();
    };
    pipe.next(item);
    pipe.emit('item', { "data" : 42 });
  });

  it('next chain', function(done) {
    var pipe = new PipeElement();

    let item = new PipeElement();
    item.onItem = function(item) {
      this.emit('item', { "data" : item.data + 1 });
    };
    item.end = function(status) {
      should(status).eql(2);
      done();
    };
    pipe
    .next((item) => {
      return { "data" : item.data + 1 };
    })
    .next(item)
    .next((item) => {
      should(item).have.property('data').eql(2);
      pipe.end(item.data);
    });
    pipe.start();
    pipe.emit('item', { "data" : 0 });
  });
});
