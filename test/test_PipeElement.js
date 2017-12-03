'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  PipeElement = require('../pipo/PipeElement');

describe('PipeElement', function() {
  it('itemOut', function(done) {
    var pipe = new PipeElement();
    pipe.once("item", (item) => {
      assert.equal(item.data, 42);
      done();
    });
    pipe.emit('item', { "data" : 42 });
  });

  it('next func', function(done) {
    var pipe = new PipeElement();
    pipe.next((item) => {
      assert.equal(item.data, 42);
      pipe.removeAllListeners();
      done();
    });
    pipe.emit('item', { "data" : 42 });
  });

  it('next pipeElement', function(done) {
    var pipe = new PipeElement();
    let item = new PipeElement();
    item.onItem = function(item) {
        assert.equal(item.data, 42);
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
      assert.equal(status, 2);
      done();
    };
    pipe
    .next((item) => {
      return { "data" : item.data + 1 };
    })
    .next(item)
    .next((item) => {
      assert.equal(item.data, 2);
      pipe.end(item.data);
    });
    pipe.start();
    pipe.emit('item', { "data" : 0 });
  });
});
