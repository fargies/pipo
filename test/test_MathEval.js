'use strict';

const
  should = require('should'),
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
            should(item).containEql(sample.out);
            should(item).not.have.property('expr');
            done();
          });
          pipe.onItem(sample.in);
        });
  });

  m.it('throws errors', function(done) {
    var pipe = new pipo.MathEval();

    pipe.once('item', (item) => {
      should(item).have.property('errorString');
      done();
    });
    pipe.onItem({ expr: '1+a' });
  });

  m.it('uses configuration', function(done) {
    var pipe = new pipo.MathEval();

    pipe.next(new pipo.Aggregate())
    .once('item', (item) => {
      should(item).have.property('items')
      .eql([ { b: 42 }, { a: 2, ret: 3} ]);
      done();
    });
    pipe.onItem({ MathEvalConfig: { expr: '1+a', property: 'ret' } });
    pipe.onItem({ b: 42 });
    pipe.onItem({ a: 2 });
    pipe.end();
  });
});
