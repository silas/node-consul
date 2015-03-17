'use strict';

/**
 * Module dependencies.
 */

require('should');

var consul = require('../lib');

/**
 * Tests
 */

describe('Consul', function() {
  before(function() {
    this.c = consul();
  });

  it('should have valid defaults', function() {
    this.c._opts.baseUrl.should.eql({
      protocol: 'http:',
      auth: null,
      port: '8500',
      hostname: '127.0.0.1',
      path: '/v1',
    });
  });
});
