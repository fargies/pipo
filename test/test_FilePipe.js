'use strict';

const
  should = require('should'),
  _ = require('lodash'),
  {describe, it, afterEach} = require('mocha'),
  tmp = require('tmp'),
  fs = require('fs');

const
  pipo = require('../pipo'),
  FilePipe = pipo.FilePipe;

describe('FilePipe', function() {
  var tmpfile;

  afterEach(function() {
    if (!_.isNil(tmpfile)) {
      tmpfile.removeCallback();
      tmpfile = null;
    }
  });

  it('loads json files', function(done) {
    tmpfile = tmp.fileSync({ postfix: '.json' });
    fs.writeSync(tmpfile.fd, '{ "item": 42 }');
    var pipe = new FilePipe(tmpfile.name);
    var accu = pipe.next(new pipo.Aggregate());

    pipe.start();
    accu.on('item', function(item) {
      should(item).have.property('items').eql([ { item: 42 } ]);
      done();
    });
  });

  it('loads cson files', function(done) {
    tmpfile = tmp.fileSync({ postfix: '.cson' });
    fs.writeSync(tmpfile.fd, "item: 42");
    var pipe = new FilePipe(tmpfile.name);
    var accu = pipe.next(new pipo.Aggregate());

    pipe.start();
    accu.on('item', function(item) {
      should(item).have.property('items').eql([ { item: 42 } ]);
      done();
    });
  });

  it('can chain FilePipes', function(done) {
    var pipe = new pipo.SubPipe();
    var accu = pipe.next(new pipo.Aggregate());

    tmpfile = tmp.fileSync({ postfix: '.json' });
    fs.writeSync(tmpfile.fd, '{ "item": 42 }');

    accu.on('item', function(item) {
      should(item).have.property('items').eql([ { item: 42 }, { item: 42 } ]);
      done();
    });
    pipe.onItem({
      'pipe': 'FilePipe#1|FilePipe#2',
      'FilePipeConfig#1': {
        'file': tmpfile.name
      },
      'FilePipeConfig#2': {
        'file': tmpfile.name
      }
    });
  });
});
