'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Status', function() {
  helper.setup(this);

  describe('leader', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/status/leader')
        .reply(200, { ok: true });

      this.consul.status.leader({}, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/status/leader')
        .reply(200, { ok: true });

      this.consul.status.leader(function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });
  });

  describe('peers', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/status/peers')
        .reply(200, [{ ok: true }]);

      this.consul.status.peers({}, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/status/peers')
        .reply(200, [{ ok: true }]);

      this.consul.status.peers(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });
});
