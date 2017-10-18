'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  tmp = require('tmp'),
  fs = require('fs');

const
  pipo = require('../pipo');

describe('Mustache', function() {

  it('renders a simple template', function(done) {
    let mstch = new pipo.Mustache();

    mstch.once("item", (item) => {
      assert.deepEqual(item, { val: 42, out: "42" });
      done();
    });
    mstch.onItem({
      val: 42,
      template: "{{val}}"
    });
  });

  it('renders an object', function(done) {
    let mstch = new pipo.Mustache();

    mstch.once("item", (item) => {
      assert.deepEqual(item, { val: "42", a: "4", z: "4" });
      done();
    });
    mstch.onItem({
      val: 4,
      template: { val: "{{val}}2", a: "{{val}}", z: "{{val}}" }
    });
  });

  it('renders from a file', function(done) {
    let mstch = new pipo.Mustache();
    mstch.ref();

    let item = {
      value: "42",
      table: [ 1, 2 ]
    };

    tmp.file(function(err, path, fd, cleanup) {
      assert.ok(!err);
      fs.writeSync(fd, "This is value: {{value}}\n");
      fs.writeSync(fd, "{{#table}}Here is an element: {{.}}\n{{/table}}");
      item.template = path;

      mstch.once("item", (item) => {
        cleanup();
        assert.ok(item.out);
        assert.ok(item.out.includes("This is value: 42\n"));
        assert.ok(item.out.includes("Here is an element: 1\n"));
        assert.ok(item.out.includes("Here is an element: 2\n"));
        assert.ok(!('template' in item));
        mstch.once("end", function() { done(); });
        mstch.unref();
      });
      mstch.onItem(item);
    });
  });

  it('renders to a file', function(done) {
    let mstch = new pipo.Mustache();
    mstch.ref();

    tmp.dir({ unsafeCleanup: true }, function(err, path, cleanup) {
      assert.ok(!err);
      mstch.once("item", () => {
        fs.readFile(path + '/test.txt', function(err, data) {
          assert.ok(!err);
          assert.equal(data.toString(), "42");
          mstch.once("end", function() { cleanup(); done(); });
          mstch.unref();
        });
      });
      mstch.onItem({
        outFile: path + '/test.txt',
        template: "{{var}}2",
        var: 4
      });
    });
  });
});
