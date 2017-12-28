
const _ = require('lodash');

module.exports = {
  dbgStr: function(item, size) {
    if (!_.isString(item)) {
      item = JSON.stringify(item);
    }
    return _.truncate(item, { length: (size || 30) });
  }
};
