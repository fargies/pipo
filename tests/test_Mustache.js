'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  tmp = require('tmp'),
  fs = require('fs');

const
  Mustache = require('../pipo/output/Mustache');

describe('Mustache', function() {

  it('generates from templates', function(done) {
    let mstch = new Mustache();

    mstch.once("item", (item) => {
      assert.equal(item.var1, "42");
      assert.equal(item.var2, "42 42");
      assert(!('mustacheVars' in item));
      done();
    });
    mstch.onItem({
      var1: "{{value}}",
      var2: "{{value}} {{value}}",
      value: "42",
      mustacheVars: [ "var1", "var2" ]
    });
  });

  it('generates a file', function(done) {
    let mstch = new Mustache();
    mstch.ref();

    let item = {
      value: "42",
      table: [ 1, 2 ]
    };

    tmp.file(function(err, path, fd, cleanup) {
      assert(!err);
      fs.writeSync(fd, "This is value: {{value}}\n");
      fs.writeSync(fd, "{{#table}}Here is an element: {{.}}\n{{/table}}");
      item.mustacheFile = path;

      mstch.once("item", (item) => {
        cleanup();
        assert(item.mustacheOut);
        assert(item.mustacheOut.includes("This is value: 42\n"));
        assert(item.mustacheOut.includes("Here is an element: 1\n"));
        assert(item.mustacheOut.includes("Here is an element: 2\n"));
        assert(!('mustacheFile' in item));
        mstch.once("end", function() { done(); });
        mstch.unref();
      });
      mstch.onItem(item);
    });
  });

  //FIXME: last
});
