'use strict';

const
  assert = require('assert'),
  _ = require('lodash'),
  {describe, before, after, it} = require('mocha'),
  stream = require('stream');

const
  pipo = require('../pipo'),
  StdIn = pipo.StdIn;

describe('StdIn', function() {
  describe('parses simple items', function() {
    var pass;
    var stdin;
    var items;

    before(function() {
      items = [];
      pass = new stream.PassThrough();
      stdin = new StdIn(pass);

      stdin.start();
      stdin.on("item", (item) => { items.push(item); });
    });

    after(function() {
      items = pass = stdin = null;
    });

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

  describe("advanced StdIn use", function() {
    it('can chain Stdin', function(done) {
      var pass1 = new stream.PassThrough();
      var pass2 = new stream.PassThrough();
      var pipe = (new StdIn(pass1))
      .next(new StdIn(pass2)).next(new pipo.Aggregate());

      pipe.on('item', function(item) {
        assert.ok(_.has(item, 'items'));
        assert.equal(_.size(item.items), 2);
        pipe.once('end', _.ary(done, 0));
      });
      pass1.write('{ "item": 42 }');
      pass2.write('{ "item": 42 }');
      pass1.end();
      pass2.end();
    });
  });
});
