'use strict';

const
  assert = require('assert'),
  m = require('mocha'),
  _ = require('lodash');

const
  pipo = require('../pipo');


m.describe('MathEval', function() {

  _.forEach([
      { in: { expr: '1+1' }, out: { result: 2 } },
      { in: { expr: '1+a', a: 1 }, out: { result: 2 }},
      { in: { expr: 'max(a)', a: [ 1, 2 ] }, out: { result: 2 }}
    ],
    function(sample) {
      m.it(`eval "${sample.in.expr}=${sample.out.result}"`,
        function(done) {
          var pipe = new pipo.MathEval();
          pipe.once('item', (item) => {
            assert.ok(_.isMatch(item, sample.out));
            assert.ok(!_.has(item, 'expr'));
            done();
          });
          pipe.onItem(sample.in);
        });
  });

  m.it('throws errors', function(done) {
    var pipe = new pipo.MathEval();

    pipe.once('item', (item) => {
      assert.ok('errorString' in item);
      done();
    });
    pipe.onItem({ expr: '1+a' });
  });

  m.it('uses configuration', function(done) {
    var pipe = new pipo.MathEval();

    pipe.next(new pipo.Aggregate())
    .once('item', (item) => {
      assert.ok('items' in item);
      assert.deepEqual(item.items[0], { b: 42 });
      assert.deepEqual(item.items[1], { a: 2, ret: 3 });
      done();
    });
    pipe.onItem({ MathEvalConfig: { expr: '1+a', property: 'ret' } });
    pipe.onItem({ b: 42 });
    pipe.onItem({ a: 2 });
    pipe.end();
  });
});
