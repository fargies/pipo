
const _ = require('lodash');

module.exports = {
  defer: function(fun) {
    return function(ret) { _.defer(fun, ret); };
  }
};
