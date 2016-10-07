'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Session', function() {
  helper.setup(this);

  describe('create', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/session/create', {
          LockDelay: '15s',
          Name: 'name1',
          Node: 'node1',
          Checks: ['a', 'b'],
          Behavior: 'release',
          TTL: '5s',
        })
        .reply(200, { ok: true });

      var opts = {
        lockdelay: '15s',
        name: 'name1',
        node: 'node1',
        checks: ['a', 'b'],
        behavior: 'release',
        ttl: '5s',
      };

      this.consul.session.create(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .put('/v1/session/create', {})
        .reply(200, { ok: true });

      this.consul.session.create(function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });
  });

  describe('destroy', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/session/destroy/123')
        .reply(200);

      var opts = { id: '123' };

      this.consul.session.destroy(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .put('/v1/session/destroy/123')
        .reply(200);

      this.consul.session.destroy('123', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.session.destroy({}, function(err) {
        should(err).have.property('message', 'consul: session.destroy: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('info', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/session/info/123')
        .reply(200, [{ ok: true }]);

      var opts = { id: '123' };

      this.consul.session.info(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work using get alias', function(done) {
      this.nock
        .get('/v1/session/info/123')
        .reply(200, [{ ok: true }]);

      var opts = { id: '123' };

      this.consul.session.get(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .get('/v1/session/info/123')
        .reply(200, []);

      this.consul.session.info('123', function(err, data) {
        should.not.exist(err);
        should.not.exist(data);

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.session.info({}, function(err) {
        should(err).have.property('message', 'consul: session.info: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('node', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/session/node/node1')
        .reply(200, { ok: true });

      var opts = { node: 'node1' };

      this.consul.session.node(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .get('/v1/session/node/node1')
        .reply(200, { ok: true });

      this.consul.session.node('node1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require node', function(done) {
      this.consul.session.node({}, function(err) {
        should(err).have.property('message', 'consul: session.node: node required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('list', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/session/list')
        .reply(200, [{ ok: true }]);

      this.consul.session.list({}, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .get('/v1/session/list')
        .reply(200, [{ ok: true }]);

      this.consul.session.list(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('renew', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/session/renew/123')
        .reply(200, { ok: true });

      var opts = { id: '123' };

      this.consul.session.renew(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with string', function(done) {
      this.nock
        .put('/v1/session/renew/123')
        .reply(200, { ok: true });

      this.consul.session.renew('123', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.session.renew({}, function(err) {
        should(err).have.property('message', 'consul: session.renew: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });
});
