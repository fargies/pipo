'use strict';

const
  should = require('should'),
  describe = require('mocha').describe,
  it = require('mocha').it;

const XQuery = require('../pipo').get('XQuery');

describe('XQuery', function() {
  var pipe = new XQuery();

  it('parse a simple document', function(done) {
    pipe.once('item', function(item) {
      should(item).have.property('value').eql('value str');
      should(item).have.property('param').eql('42');
      done();
    });
    pipe.onItem({
      xml: "<html><body><div>" +
        "<div id=\"catchme\"><div param=\"42\">value str</div></div>" +
        "</div></body></html><html><body><a href=\"pwet\"></a></body></html>",
      query: "//div[contains(@id,'catchme')]/div",
      subQueries: {
        value: "/text()",
        param: "/@param" // /string()
      }
    });
  });

  it('uses configuration', function(done) {
    pipe.once('item', function(item) {
      should(item).have.property('value').eql('value str');
      done();
    });
    pipe.onItem({
      XQueryConfig: {
        query: "//div",
        subQueries: { value: '/text()' },
        trim: true
      }
    });
    pipe.onItem({ xml: '<div>  value str</div>' });
  });
});
