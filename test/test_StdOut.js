'use strict';

const
  _ = require('lodash'),
  should = require('should'),
  { describe, it, before, after } = require('mocha'),
  stream = require('stream'),
  colors = require('colors'),

  { dbgStr } = require('./Helpers');

const
  StdIn = require('../pipo/StdIn'),
  StdOut = require('../pipo/StdOut');

describe('StdOut', function() {
  var colorsEnabled = colors.enabled;
  before(function() {
    colors.enabled = true;
  });
  after(function() {
    colors.enabled = colorsEnabled;
  });


  describe('In/Out', function() {
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

  _.forEach([
    { config: { indent: 0 }, in: { data: 4.2 }, out: '{"data":4.2}\n' },
    { config: { indent: 0 }, in: {data:{data:{data:[4,2]}}}, out: '{"data":{"data":{"data":[4,2]}}}\n' },
    { config: { indent: 2 }, in: {data: "test"}, out: '{\n  "data": "test"\n}\n' }
  ], function(test) {
    it(`${dbgStr(test.in)} with config ${dbgStr(test.config)} displays ${dbgStr(test.out)}`,
      function(done) {
        var pass = new stream.PassThrough();
        var stdout = new StdOut(pass);

        stdout.once('end', function() {
          var text = pass.read();
          should.exist(text);
          text = text.toString();

          should(text).eql(test.out);
          done();
        });
        stdout.onItem({ StdOutConfig: test.config });
        stdout.onItem(test.in);
      });
  });

  const colorRe = new RegExp(/\u001b\[[0-9]{1,2}m/g);
  _.forEach([
    { config: { indent: 0 }, in: { data: 4.2, another: 1 }, out: '{"data":4.2,"another":1}\n' },
    { config: { indent: 0 }, in: {data:{data:{data:[4,2,true,false,null]}}},
      out: '{"data":{"data":{"data":[4,2,true,false,null]}}}\n' },
    { config: { indent: 2 }, in: {data: "test"}, out: '{"data":"test"}\n' },

    /* Max 80 cols for short form */
    { config: { indent: 2 }, in: { "t": ' '.repeat(71) },
      out: `{"t":"${' '.repeat(71)}"}\n` },
    { config: { indent: 2 }, in: { "t": ' '.repeat(72) },
      out: `{\n  "t": "${' '.repeat(72)}"\n}\n` },

    /* Max 80 cols for short form */
    { config: { indent: 2 }, in: [ ' '.repeat(80 - 6 - 1), 1 ],
      out: `["${' '.repeat(80 - 6 - 1)}",1]\n` },
    { config: { indent: 2 }, in: [ ' '.repeat(80 - 6), 1 ],
      out: `[\n  "${' '.repeat(80 - 6)}",\n  1\n]\n` },
    { config: { indent: 2 }, in: { "t": ' '.repeat(72) },
      out: `{\n  "t": "${' '.repeat(72)}"\n}\n` }
  ], function(test) {
    it(`${dbgStr(test.in)} with config ${dbgStr(test.config)} displays (colored) ${dbgStr(test.out)}`,
      function(done) {
        var pass = new stream.PassThrough();
        pass.isTTY = true; /* force colored/optimised output */
        var stdout = new StdOut(pass);

        stdout.once('end', function() {
          var text = pass.read();
          should.exist(text);
          text = text.toString();
          text.should.match(colorRe);
          text = text.replace(colorRe, '');

          should(text).eql(test.out);
          done();
        });
        stdout.onItem({ StdOutConfig: test.config });
        stdout.onItem(test.in);
      });
  });

  describe('Colorify', function() {
    it('computes minimum string size of objects', function() {
      var c = new StdOut.Colorify();

      _.forEach([
        { obj: null, size: 'null'.length },
        { obj: true, size: 'true'.length },
        { obj: false, size: 'false'.length },
        { obj: 'test', size: '"test"'.length },
        { obj: undefined, size: 0 },
        { obj: function() {}, size: 0 },
        { obj: [null,true,'test'], size: '[null,true,"test"]'.length },
        { obj: {'to':'toto','ti':'ti'}, size: '{"to":"toto","ti":"ti"}'.length }
      ], function(test) {
        should(c.minSize(test.obj))
        .eql(test.size, `Wrong size for ${JSON.stringify(test.obj)}`);
      });
    });
  });
});
