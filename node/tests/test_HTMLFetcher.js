'use strict';

const
  assert = require('assert'),
  m = require('mocha');

const
  http = require('http'),
  pipo = require('../pipo');


m.describe('HTMLFetcher', function() {
  var stubServer;
  var addr;

  m.before(function() {
    stubServer = http.createServer(function(req, res) {
      process.nextTick(function() {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ok');
      });
    });
    stubServer.listen();
    addr = stubServer.address();
  });
  m.after(function() {
    stubServer.close();
    stubServer = null;
  });


  m.it('fetches messages', function(done) {
    var pipe = new pipo.HTMLFetcher();

    pipe.on('item', (item) => {
      assert('html' in item);
      assert.equal(item.html, 'ok');
      done();
    });
    pipe.onItem({ "url" : `http://${addr.address}:${addr.port}` });
  });

  m.it('ends only once finished', function(done) {
    var fetcher = new pipo.HTMLFetcher();
    var pipe = new pipo.PipeElement();
    var item;

    pipe
    .next(fetcher)
    .on('item', (i) => { item = i; })
    .on('end', () => {
      assert(item);
      assert('html' in item);
      assert.equal(item.html, 'ok');
      done();
    });

    fetcher.onItem({ "url" : `http://${addr.address}:${addr.port}` });
    fetcher.end(0);
  });
});
