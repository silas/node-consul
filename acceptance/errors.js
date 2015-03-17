'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var errors = require('../lib/errors');

/**
 * Tests
 */

describe('errors', function() {
  describe('Consul', function() {
    it('should work', function() {
      var msg = 'test message';

      var err = errors.Consul(msg);
      err.should.have.property('isConsul', true);
      err.should.have.property('message', msg);

      var test = new Error(msg);
      test.isTest = true;

      err = errors.Consul(test);
      err.should.have.property('message', msg);
      err.should.have.property('isConsul', true);
      err.should.have.property('isTest', true);

      err = errors.Consul(null);
      err.should.not.have.property('message', undefined);
      err.should.have.property('isConsul', true);

      err = errors.Consul('');
      err.should.not.have.property('message', undefined);
      err.should.have.property('isConsul', true);
    });
  });

  describe('Validation', function() {
    it('should work', function() {
      var msg = 'test';
      var err = errors.Validation(msg);

      should(err).have.property('isConsul', true);
      should(err).have.property('isValidation', true);
      should(err).have.property('message', msg);

      should(errors.Validation).not.have.property('message');
    });
  });
});
