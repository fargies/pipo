'use strict';

const
  {describe, it} = require('mocha'),
  assert = require('assert');

const
  pipo = require('../pipo'),
  DataIn = require('../pipo/DataIn');

describe('DataIn', function() {
  it('parses json', function(done) {
    var dataIn = new DataIn();
    var accu = new pipo.Aggregate();
    dataIn.next(accu);

    accu.once('item', function(item) {
      assert.deepEqual(item, {
        items: [
          { sample: "{{{{\"" },
          { partial: "item" }
        ]
      });
      done();
    });
    dataIn.add(new Buffer('  { "sample": "{{{{\\"" }'));
    dataIn.add(new Buffer('{ "par'));
    dataIn.add(new Buffer('tial": '));
    dataIn.add(new Buffer(' "item" }'));
    accu.end(0);
  });
});
