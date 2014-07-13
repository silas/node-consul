'use strict';

/* jshint expr: true */

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
      slashes: true,
      auth: null,
      host: '127.0.0.1:8500',
      port: '8500',
      hostname: '127.0.0.1',
      hash: null,
      search: null,
      query: null,
      pathname: '/v1',
      path: '/v1',
      href: 'http://127.0.0.1:8500/v1',
    });
  });
});
