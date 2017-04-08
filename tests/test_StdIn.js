'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  stream = require('stream');

const
  StdIn = require('../pipo/StdIn');

describe('StdIn', function() {
  describe('parses simple items', function() {
    var pass = new stream.PassThrough();
    var stdin = new StdIn(pass);
    var items = [];
    stdin.start();
    stdin.on("item", (item) => { items.push(item); });

    it('parse simple stream', function(done) {
      stdin.once("item", (item) => {
        assert.equal(item.data, 1);
        done();
      });
      pass.write('{ "data" : 1 }');
    });

    it('parse parts', function(done) {
      var item = "{ \"data\" : 2 }".split('');

      stdin.once("item", (item) => {
        assert.equal(item.data, 2);
        done();
      });
      item.forEach(function(val) {
        pass.write(val);
      });
    });

    it('parse empty parts', function(done) {
      var item = "{ \"data\" : 3 }".split(' ');

      stdin.once("item", (item) => {
        assert.equal(item.data, 3);
        done();
      });
      item.forEach(function(val) {
        pass.write(val);
        for (var i = 0; i < 1024; ++i) {
          pass.write(' ');
        }
      });
    });

    it('parse several objects and finishes', function(done) {
      stdin.on('end', () => {
        assert.equal(items.length, 5);
        done();
      });
      pass.write('{ "data" : 1 }{"data": 42}');
      pass.end();
    });
  });
});