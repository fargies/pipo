'use strict';

const
  assert = require('assert'),
  {it, describe} = require('mocha'),
  moment = require('moment'),
  _ = require('lodash');

const
  pipo = require('../pipo');


describe('NLDate', function() {

  _.forEach([
      { in: 'now', format: null, out: moment() },
      { in: '1 month ago', format: "YYYY-MM-DD",
        out: moment().subtract(1, "month").hours(0).minutes(0).seconds(0) },
      { in: 'a day ago', out: moment().subtract(1, "day") },
      { in: 'in 2 days', out: moment().add(2, "days") },
      { in: '2017-09-02', out: moment("2017-09-02") }
    ],
    function(sample) {
      it(`parses "${sample.in}"`, function(done) {
        var pipe = new pipo.NLDate();
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
    }
  );

  it('can parse a sub-property', function(done) {
    var pipe = new pipo.NLDate();
    pipe.once('item', (item) => {
      assert.ok(!_.isEmpty(_.get(item, [ 'date', 'sub' ])));
      assert.ok(moment().diff(moment(item.date.sub), 'seconds') < 10);
      done();
    });
    pipe.onItem({
      NLDateConfig: { property: "date.sub" },
      date: { sub: "now" }
    });
  });
});
