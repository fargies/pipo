'use strict';

const
  assert = require('assert'),
  m = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


m.describe('Date', function() {
  var pipe = new pipo.Date();

  _.forEach([
      { in: 1505939177, inFormat: 'X', outFormat: 'YYYY-MM-DD', out: '2017-09-20' },
      { in: '2017-09-20', inFormat: 'YYYY-MM-DD', outFormat: 'YYYY-MM-DD', out: '2017-09-20' },
      { in: '2017-09-20', inFormat: 'YYYY-MM-DD', outFormat: 'X', out: '1505858400' },
    ],
    function(sample) {
      m.it(`format "${sample.in}"`, function(done) {
      pipe.once('item', (item) => {
        assert.ok(!_.isEmpty(item.date));
        assert.equal(sample.out, item.date);
        done();
      });
      pipe.onItem({
        DateConfig: {
          property: "date",
          inFormat: sample.inFormat,
          outFormat: sample.outFormat
        },
        date: sample.in
      });
    });
  });
});
