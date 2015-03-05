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
  describe('Validation', function() {
    it('should workd', function() {
      var msg = 'test';
      var err = errors.Validation(msg);

      should(err).have.property('isConsul', true);
      should(err).have.property('isValidation', true);
      should(err).have.property('message', msg);

      should(errors.Validation).not.have.property('message');
    });
  });
});
