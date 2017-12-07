'use strict';

const
  should = require('should'),
  { describe, before } = require('mocha'),
  it = require('mocha').it;

const
  HTMLToXML = require('../pipo').get('HTMLToXML');

describe('HTMLToXML', function() {
  var pipe;

  before(function() {
    pipe = new HTMLToXML();
  });

  it('simple', function(done) {
    pipe.once('item', function(item) {
      should(item).have.property('xml');
      done();
    });
    pipe.onItem({ "html": "<html><body><a href=\"pwet\"></a></body></html>" });
  });

  it('NoNamespaces', function(done) {
    pipe.once('item', function(item) {
      should(item).have.property('xml')
      .containEql('ugly_ns=')
      .containEql('another_ns=')
      .containEql('33:33')
      .containEql('32:32');
      done();
    });
    pipe.onItem({ "html": "<html><body>" +
              "<a ugly:ns=\"42\" another:ns=\"33:33\">" +
              "</a>32:32</body></html>" });
  });

  it('config', function() {
    should(pipe).have.property('noNamespaces', true);
    pipe.onItem({ "HTMLToXMLConfig": { "noNamespaces": false } });
    should(pipe).have.property('noNamespaces', false);

    pipe.onItem({ "HTMLToXMLConfig#Named": { "noNamespaces": true } });
    should(pipe).have.property('noNamespaces', false);

    pipe.setName('Named');
    pipe.onItem({ "HTMLToXMLConfig#Named": { "noNamespaces": true } });
    should(pipe).have.property('noNamespaces', true);
  });
});
