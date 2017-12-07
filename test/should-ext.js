
const
  _ = require('lodash'),
  should = require('should');

should.use(function(should, Assertion) {
  Assertion.add('get', function(name) {
    this.params = { operator: `to have property '${name}'` };

    should.ok(_.hasIn(this.obj, name));
    this.obj = _.get(this.obj, name);
  });
});

module.exports = should;
