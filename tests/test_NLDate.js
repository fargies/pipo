'use strict';

const
  assert = require('assert'),
  m = require('mocha'),
  moment = require('moment'),
  _ = require('lodash');

const
  pipo = require('../pipo');


m.describe('NLDate', function() {
  var pipe = new pipo.NLDate();

  _.forEach([
      { in: 'now', format: null, out: moment() },
      { in: '1 month ago', format: "YYYY-MM-DD",
        out: moment().subtract(1, "month").hours(0).minutes(0).seconds(0) },
      { in: 'yesterday', out: moment().subtract(1, "day") },
      { in: 'in 2 days', out: moment().add(2, "days") },
      { in: '2017-09-02', out: moment("2017-09-02") }
    ],
    function(sample) {
      m.it(`parses "${sample.in}"`, function(done) {
      pipe.once('item', (item) => {
        assert.ok(!_.isEmpty(item.date));
        assert.ok(sample.out.diff(moment(item.date), 'seconds') < 10);
        done();
      });
      pipe.onItem({
        NLDateConfig: { property: "date", format: sample.format },
        date: sample.in
      });
    });
  });
});
