'use strict';

const
  should = require('should'),
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
      should(item).have.property('file', 'test.txt');
      tmpfile.removeCallback();
      tmpdir.removeCallback();
      done();
    });

    pipe.onItem({ "file" : tmpdir.name + '/' + tmpfile.name, "dest" : "test.txt" });
  });
});
