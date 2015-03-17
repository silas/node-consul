'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

helper.describe('Status', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  describe('leader', function() {
    it('should return leader', function(done) {
      this.c1.status.leader(function(err, data) {
        should.not.exist(err);

        should(data).eql('127.0.0.1:8300');

        done();
      });
    });
  });

  describe('peers', function() {
    it('should return peers', function(done) {
      this.c1.status.peers(function(err, data) {
        should.not.exist(err);

        should(data).eql(['127.0.0.1:8300']);

        done();
      });
    });
  });
});
