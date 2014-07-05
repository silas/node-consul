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
    this.c.opts.baseUrl.should.eql({
      protocol: 'http:',
      slashes: true,
      auth: null,
      host: 'localhost:8500',
      port: '8500',
      hostname: 'localhost',
      hash: null,
      search: null,
      query: null,
      pathname: '/v1',
      path: '/v1',
      href: 'http://localhost:8500/v1',
    });
  });
});
