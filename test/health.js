'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Health', function() {
  helper.setup(this);

  describe('node', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/health/node/node1')
        .reply(200, { ok: true });

      var opts = { node: 'node1' };

      this.consul.health.node(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with one argument', function(done) {
      this.nock
        .get('/v1/health/node/node1')
        .reply(200, { ok: true });

      this.consul.health.node('node1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require node', function(done) {
      this.consul.health.node({}, function(err) {
        should(err).have.property('message', 'consul: health.node: node required');

        done();
      });
    });
  });

  describe('checks', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/health/checks/service1')
        .reply(200, { ok: true });

      var opts = { service: 'service1' };

      this.consul.health.checks(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with one argument', function(done) {
      this.nock
        .get('/v1/health/checks/service1')
        .reply(200, { ok: true });

      this.consul.health.checks('service1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require service', function(done) {
      this.consul.health.checks({}, function(err) {
        should(err).have.property('message', 'consul: health.checks: service required');

        done();
      });
    });
  });

  describe('service', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/health/service/service1?tag=tag1&passing=true')
        .reply(200, { ok: true });

      var opts = {
        service: 'service1',
        tag: 'tag1',
        passing: 'true',
      };

      this.consul.health.service(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with one argument', function(done) {
      this.nock
        .get('/v1/health/service/service1')
        .reply(200, { ok: true });

      this.consul.health.service('service1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require service', function(done) {
      this.consul.health.service({}, function(err) {
        should(err).have.property('message', 'consul: health.service: service required');

        done();
      });
    });
  });

  describe('state', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/health/state/any')
        .reply(200, { ok: true });

      var opts = { state: 'any' };

      this.consul.health.state(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with one argument', function(done) {
      this.nock
        .get('/v1/health/state/warning')
        .reply(200, { ok: true });

      this.consul.health.state('warning', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require state', function(done) {
      this.consul.health.state({}, function(err) {
        should(err).have.property('message', 'consul: health.state: state required');

        done();
      });
    });

    it('should require valid state', function(done) {
      this.consul.health.state('foo', function(err) {
        should(err).have.property('message', 'consul: health.state: state invalid: foo');

        done();
      });
    });
  });
});
