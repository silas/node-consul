'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Agent', function() {
  helper.setup(this);

  describe('members', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/agent/members')
        .reply(200, [{ ok: true }]);

      var opts = {};

      this.consul.agent.members(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/agent/members')
        .reply(200, [{ ok: true }]);

      this.consul.agent.members(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('self', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/agent/self')
        .reply(200, { ok: true });

      var opts = {};

      this.consul.agent.self(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/agent/self')
        .reply(200, { ok: true });

      this.consul.agent.self(function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });
  });

  describe('maintenance', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/agent/maintenance?enable=true&reason=test')
        .reply(200);

      var opts = { enable: true, reason: 'test' };

      this.consul.agent.maintenance(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with just enable', function(done) {
      this.nock
        .put('/v1/agent/maintenance?enable=false')
        .reply(200);

      this.consul.agent.maintenance(false, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require enable', function(done) {
      this.consul.agent.maintenance({}, function(err) {
        should(err).have.property('message', 'consul: agent.maintenance: enable required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('join', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/agent/join/127.0.0.2')
        .reply(200);

      var opts = { address: '127.0.0.2' };

      this.consul.agent.join(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with just address', function(done) {
      this.nock
        .get('/v1/agent/join/127.0.0.2')
        .reply(200);

      this.consul.agent.join('127.0.0.2', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require address', function(done) {
      this.consul.agent.join({}, function(err) {
        should(err).have.property('message', 'consul: agent.join: address required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('forceLeave', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/agent/force-leave/node')
        .reply(200);

      var opts = { node: 'node' };

      this.consul.agent.forceLeave(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with just address', function(done) {
      this.nock
        .get('/v1/agent/force-leave/node')
        .reply(200);

      this.consul.agent.forceLeave('node', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require node', function(done) {
      this.consul.agent.forceLeave({}, function(err) {
        should(err).have.property('message', 'consul: agent.forceLeave: node required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });
});
