'use strict';

const
  assert = require('assert'),
  _ = require('lodash'),
  {describe, it, beforeEach, afterEach} = require('mocha'),
  tmp = require('tmp'),
  fs = require('fs');

const
  pipo = require('../pipo'),
  FilePipe = pipo.FilePipe;

describe('FilePipe', function() {
  var tmpfile;

  beforeEach(function() {
    tmpfile = tmp.fileSync();
  });

  afterEach(function() {
   tmpfile.removeCallback();
    tmpfile = null;
  });

  it('load json files', function(done) {
    fs.writeSync(tmpfile.fd, '{ "item": 42 }');
    var pipe = new FilePipe(tmpfile.name);
    var accu = pipe.next(new pipo.Aggregate());

    pipe.start();
    accu.on('item', function(item) {
      assert.equal(_.size(item.items), 1);
      assert.equal(item.items[0].item, 42);
      done();
    });
  });

  it('can chain FilePipes', function(done) {
    var pipe = new pipo.SubPipe();
    var accu = pipe.next(new pipo.Aggregate());
    fs.writeSync(tmpfile.fd, '{ "item": 42 }');

    accu.on('item', function(item) {
      assert.equal(_.size(item.items), 2);
      assert.equal(item.items[0].item, 42);
      assert.equal(item.items[1].item, 42);
      done();
    });
    pipe.onItem({
      'pipe': 'FilePipe#1|FilePipe#2',
      'FilePipeConfig#1': {
        'file': tmpfile.name,
      },
      'FilePipeConfig#2': {
        'file': tmpfile.name,
      }
    });
    pipe.end(0);
  });
});
