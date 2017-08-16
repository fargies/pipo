'use strict';

const
  assert = require('assert'),
  m = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


m.describe('YahooFinance', function() {
  m.it('fetches a quote', function(done) {
    var pipe = new pipo.YahooFinance();

    pipe.on('item', (item) => {
      assert.ok(!_.isEmpty(item.quotes));
      done();
    });
    pipe.onItem({ symbol: 'SO.PA', from: '2017-06-01', to: '2017-06-02' });
  }).timeout(10000);

  m.it('fails on non existing quote', function(done) {
    var pipe = new pipo.YahooFinance();

    pipe.on('item', (item) => {
      assert.ok(_.isEmpty(item.quotes));
      assert.ok(_.has(item, 'errorString'));
      done();
    });
    pipe.onItem({ symbol: 'SO.NONE', from: '2017-06-01', to: '2017-06-02' });
  }).timeout(4000);

  m.it('fails with invalid date', function(done) {
    var pipe = new pipo.YahooFinance();

    pipe.on('item', (item) => {
      assert.ok(_.isEmpty(item.quotes));
      assert.ok(_.has(item, 'errorString'));
      done();
    });
    pipe.onItem({ symbol: 'SO.PA', from: '2017-xx-xx', to: '2017-06-02' });
  }).timeout(4000);

});