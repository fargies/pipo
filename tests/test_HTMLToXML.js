'use strict';

const
  assert = require('assert'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const
  HTMLToXML = require('../pipo').get('HTMLToXML');

describe('HTMLToXML', function() {
  var pipe = new HTMLToXML();

  it('simple', function(done) {
    pipe.once('item', function(item) {
      assert('xml' in item);
      done();
    });
    pipe.onItem({ "html": "<html><body><a href=\"pwet\"></a></body></html>" });
  });

  it('NoNamespaces', function(done) {
    pipe.once('item', function(item) {
      assert('xml' in item);
      assert(item.xml.includes('ugly_ns='));
      assert(item.xml.includes('another_ns='));
      assert(item.xml.includes('33:33'));
      assert(item.xml.includes('32:32'));
      done();
    });
    pipe.onItem({ "html": "<html><body>" +
              "<a ugly:ns=\"42\" another:ns=\"33:33\">" +
              "</a>32:32</body></html>" });
  });

  it('config', function() {
    assert.equal(pipe.noNamespaces, true);
    pipe.onItem({ "HTMLToXMLConfig": { "noNamespaces": false } });
    assert.equal(pipe.noNamespaces, false);

    pipe.onItem({ "HTMLToXMLConfig#Named": { "noNamespaces": true } });
    assert.equal(pipe.noNamespaces, false);

    pipe.setName('Named');
    pipe.onItem({ "HTMLToXMLConfig#Named": { "noNamespaces": true } });
    assert.equal(pipe.noNamespaces, true);
  });
});
