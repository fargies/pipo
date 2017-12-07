'use strict';

const
  process = require('process'),
  { before } = require('mocha');

require('./should-ext');

before(function() {
  /* do not accept unhandledRejection */
  process.on('unhandledRejection', function (reason) {
    throw reason;
  });
});
