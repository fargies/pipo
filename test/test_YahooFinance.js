'use strict';

const
  should = require('should'),
  m = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


m.describe('YFHistory', function() {
  m.it('fetches a quote', function(done) {
    var pipe = new pipo.YFHistory();

    pipe.on('item', (item) => {
      should(item).have.property('open');
      done();
    });
    pipe.onItem({ symbol: 'SO.PA', from: '2017-06-02', to: '2017-06-02' });
  }).timeout(30000);

  m.it('fails on non existing quote', function(done) {
    var pipe = new pipo.YFHistory();

    pipe.on('item', (item) => {
      should(item).not.have.property('open');
      should(item).have.property('errorString');
      done();
    });
    pipe.onItem({ symbol: 'SO.NONE', from: '2017-06-01', to: '2017-06-02' });
  }).timeout(4000);

  m.it('fails with invalid date', function(done) {
    var pipe = new pipo.YFHistory();

    pipe.on('item', (item) => {
      should(item).not.have.property('open');
      should(item).have.property('errorString');
      done();
    });
    pipe.onItem({ symbol: 'SO.PA', from: '2017-xx-xx', to: '2017-06-02' });
  }).timeout(4000);

});
