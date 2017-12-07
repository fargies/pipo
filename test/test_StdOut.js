'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  stream = require('stream');

const
  StdIn = require('../pipo/StdIn'),
  StdOut = require('../pipo/StdOut');

describe('StdOut', function() {
  var pass = new stream.PassThrough();

  var stdin = new StdIn(pass);
  var stdout = new StdOut(pass);

  it('sends items', function(done) {
    stdin.once('item', (item) => {
      should(item).have.property('data').eql(42);
      done();
    });
    stdout.onItem({ "data" : 42 });
  });

  it('forwards items', function(done) {
    stdout.once('item', (item) => {
      should(item).have.property('data').eql(42);
      done();
    });
    stdout.onItem({ "data" : 42 });
  });
});
