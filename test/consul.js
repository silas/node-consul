'use strict';

/* jshint expr: true */

/**
 * Module dependencies.
 */

var consul = require('../lib');

/**
 * Tests
 */

describe('Consul', function() {
  before(function() {
    this.c = consul();
  });

  it('should have valid defaults', function() {
    this.c.host.should.eql('localhost');
    this.c.port.should.eql('8500');
  });
});
