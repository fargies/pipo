'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  http = require('http'),
  pipo = require('../pipo');


describe('HTMLFetcher', function() {
  var stubServer = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('ok');
  });
  stubServer.listen();
  var addr = stubServer.address();

  it('fetches messages', function(done) {
    var pipe = new pipo.HTMLFetcher();

    pipe.on('item', (item) => {
      assert('html' in item);
      assert.equal(item.html, 'ok');
      done();
    });
    pipe.onItem({ "url" : `http://${addr.address}:${addr.port}` });
  });
});
