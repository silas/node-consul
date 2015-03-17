'use strict';

/**
 * Module dependencies.
 */

require('should');

var nock = require('nock');

var consul = require('../lib');

/**
 * Setup tests
 */

function setup(scope) {
  if (scope._setup) return;
  scope._setup = true;

  beforeEach.call(scope, function() {
    var self = this;

    nock.disableNetConnect();

    Object.defineProperty(self, 'consul', {
      configurable: true,
      enumerable: true,
      get: function() {
        return consul();
      },
    });

    Object.defineProperty(self, 'nock', {
      configurable: true,
      enumerable: true,
      get: function() {
        return nock('http://127.0.0.1:8500');
      },
    });
  });

  afterEach.call(scope, function() {
    nock.cleanAll();
  });
}

/**
 * Module exports.
 */

exports.consul = consul;
exports.setup = setup;
