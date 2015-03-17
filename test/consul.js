'use strict';

/**
 * Module dependencies.
 */

var helper = require('./helper');

/**
 * Tests
 */

describe('Consul', function() {
  helper.setup(this);

  it('should work', function() {
    helper.consul()._opts.baseUrl.should.eql({
      protocol: 'http:',
      auth: null,
      port: '8500',
      hostname: '127.0.0.1',
      path: '/v1',
    });

    helper.consul({
      host: '127.0.0.2',
      port: '8501',
      secure: true,
    })._opts.baseUrl.should.eql({
      protocol: 'https:',
      auth: null,
      port: '8501',
      hostname: '127.0.0.2',
      path: '/v1',
    });

    helper.consul({
      baseUrl: 'https://user:pass@example.org:8502/proxy/v1',
    })._opts.baseUrl.should.eql({
      protocol: 'https:',
      auth: 'user:pass',
      port: '8502',
      hostname: 'example.org',
      path: '/proxy/v1',
    });
  });
});
