'use strict';

const
  _ = require('lodash'),
  should = require('should'),
  { it, describe } = require('mocha');

const
  pipo = require('../pipo'),
  { dbgStr } = require('./Helpers');


describe('MathFilter', function() {
  function checkValid(test) {
    it(`${dbgStr(test.item, 20)} validates ${dbgStr(test.expr, 20)}`,
      function(done) {
        var pipe = new pipo.MathFilter();

        pipe.once('item', (item) => {
          should(item).eql(test.item);
          done();
        });
        pipe.onItem({ MathFilterConfig: { expr: test.expr } });
        pipe.onItem(test.item);
        pipe.end(0);
      }
    );
  }

  function checkInvalid(test) {
    it(`${dbgStr(test.item, 20)} does not validate ${dbgStr(test.expr, 20)}`,
      function(done) {
        var pipe = new pipo.MathFilter();
        var count = 0;

        pipe.on('item', () => {
          count += 1;
        })
        .once('end', () => {
          count.should.eql(0);
          done();
        });
        pipe.onItem({ MathFilterConfig: { expr: test.expr } });
        pipe.onItem(test.item);
        pipe.end(0);
      }
    );
  }

  _.forEach([
    { expr: 'value - 2 == 0', item: { value: 2 } },
    { expr: 'value == 42', item: { value: 42 } },
    { expr: 'value == 42', item: { value: 42, toto: 44 } },
    { expr: 'value', item: { value: true } },
    { expr: 'value', item: { value: 1 } }
  ], checkValid);

  _.forEach([
    { expr: 'value', item: { value: false } },
    { expr: 'value', item: { value: 0 } },
    { expr: 'value == 0', item: { value2: 0 } },
    { expr: 'value - 2 == 0', item: { value: 3 } }
  ], checkInvalid);

});
