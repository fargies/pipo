'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it,
  tmp = require('tmp');

const
  pipo = require('../pipo');


describe('RenameFile', function() {

  it('rename a file', function(done) {
    var tmpdir = tmp.dirSync({ unsafeCleanup: true });
    var tmpfile = tmp.fileSync({ prefix: 'test', dir: tmpdir.name });
    var pipe = new pipo.RenameFile();

    pipe.on('item', (item) => {
      assert('file' in item);
      assert.equal(item.file, 'test.txt');
      tmpfile.removeCallback();
      tmpdir.removeCallback();
      done();
    });

    pipe.onItem({ "file" : tmpdir.name + '/' + tmpfile.name, "dest" : "test.txt" });
    pipe.end(0);
  });

  it('filters contents', function(done) {
    var tmpdir = tmp.dirSync({ unsafeCleanup: true });
    var tmpfile = tmp.fileSync({ prefix: 'test', dir: tmpdir.name });
    var tmpfile2 = tmp.fileSync({ prefix: 'filtered', dir: tmpdir.name });

    var pipe = new pipo.ListDir();
    var count = 0;

    pipe.on('item', (item) => {
      assert('file' in item);
      ++count;
    })
    .on('end', () => {
      assert.equal(count, 1);
      tmpfile.removeCallback();
      tmpfile2.removeCallback();
      tmpdir.removeCallback();
      done();
    });

    pipe.setPattern('^test');
    pipe.onItem({ "dir" : tmpdir.name });
    pipe.end(0);
  });
});
