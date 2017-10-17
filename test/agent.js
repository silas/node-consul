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

  describe('checks', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/agent/checks')
        .reply(200, [{ ok: true }]);

      var opts = {};

      this.consul.agent.checks(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/agent/checks')
        .reply(200, [{ ok: true }]);

      this.consul.agent.checks(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('check', function() {
    describe('list', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/agent/checks')
          .reply(200, [{ ok: true }]);

        var opts = {};

        this.consul.agent.check.list(opts, function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with no arguments', function(done) {
        this.nock
          .get('/v1/agent/checks')
          .reply(200, [{ ok: true }]);

        this.consul.agent.check.list(function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });
    });

    describe('register', function() {
      it('should work (http)', function(done) {
        this.nock
          .put('/v1/agent/check/register', {
            ID: '123',
            Name: 'test',
            ServiceID: 'service',
            HTTP: 'http://example.org/',
            TLSSkipVerify: true,
            Interval: '5s',
            Notes: 'http check',
            Status: 'critical',
          })
          .reply(200);

        var opts = {
          id: '123',
          name: 'test',
          service_id: 'service',
          http: 'http://example.org/',
          tls_skip_verify: true,
          interval: '5s',
          notes: 'http check',
          status: 'critical',
        };

        this.consul.agent.check.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work (script)', function(done) {
        this.nock
          .put('/v1/agent/check/register', {
            Name: 'test',
            Script: 'true',
            Interval: '5s',
          })
          .reply(200);

        var opts = {
          name: 'test',
          script: 'true',
          interval: '5s',
        };

        this.consul.agent.check.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work (ttl)', function(done) {
        this.nock
          .put('/v1/agent/check/register', {
            ID: '123',
            Name: 'test',
            ServiceID: 'service',
            TTL: '10s',
            Notes: 'ttl check',
          })
          .reply(200);

        var opts = {
          id: '123',
          name: 'test',
          serviceid: 'service',
          ttl: '10s',
          notes: 'ttl check',
        };

        this.consul.agent.check.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require check', function(done) {
        var opts = {
          name: 'test',
          serviceid: 'service',
        };

        this.consul.agent.check.register(opts, function(err) {
          should(err).property('message',
            'consul: agent.check.register: http/tcp/script and interval, or ttl required');

          done();
        });
      });

      it('should require name', function(done) {
        var opts = {
          http: 'http://localhost:5000/health',
          interval: '10s',
        };

        this.consul.agent.check.register(opts, function(err) {
          should(err).property('message', 'consul: agent.check.register: name required');

          done();
        });
      });
    });

    describe('deregister', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/agent/check/deregister/123')
          .reply(200);

        var opts = { id: '123' };

        this.consul.agent.check.deregister(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with just id', function(done) {
        this.nock
          .get('/v1/agent/check/deregister/123')
          .reply(200);

        this.consul.agent.check.deregister('123', function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require id', function(done) {
        this.consul.agent.check.deregister({}, function(err) {
          should(err).property('message', 'consul: agent.check.deregister: id required');

          done();
        });
      });
    });

    describe('pass', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/agent/check/pass/123?note=ok')
          .reply(200);

        var opts = {
          id: '123',
          note: 'ok',
        };

        this.consul.agent.check.pass(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with just id', function(done) {
        this.nock
          .get('/v1/agent/check/pass/123')
          .reply(200);

        this.consul.agent.check.pass('123', function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require id', function(done) {
        this.consul.agent.check.pass({}, function(err) {
          should(err).property('message', 'consul: agent.check.pass: id required');

          done();
        });
      });
    });

    describe('warn', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/agent/check/warn/123?note=ify')
          .reply(200);

        var opts = {
          id: '123',
          note: 'ify',
        };

        this.consul.agent.check.warn(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with just id', function(done) {
        this.nock
          .get('/v1/agent/check/warn/123')
          .reply(200);

        this.consul.agent.check.warn('123', function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require id', function(done) {
        this.consul.agent.check.warn({}, function(err) {
          should(err).property('message', 'consul: agent.check.warn: id required');

          done();
        });
      });
    });

    describe('fail', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/agent/check/fail/123?note=error')
          .reply(200);

        var opts = {
          id: '123',
          note: 'error',
        };

        this.consul.agent.check.fail(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with just id', function(done) {
        this.nock
          .get('/v1/agent/check/fail/123')
          .reply(200);

        this.consul.agent.check.fail('123', function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require id', function(done) {
        this.consul.agent.check.fail({}, function(err) {
          should(err).property('message', 'consul: agent.check.fail: id required');

          done();
        });
      });
    });
  });

  describe('services', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/agent/services')
        .reply(200, [{ ok: true }]);

      var opts = {};

      this.consul.agent.services(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/agent/services')
        .reply(200, [{ ok: true }]);

      this.consul.agent.services(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('service', function() {
    describe('list', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/agent/services')
          .reply(200, [{ ok: true }]);

        var opts = {};

        this.consul.agent.service.list(opts, function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with no arguments', function(done) {
        this.nock
          .get('/v1/agent/services')
          .reply(200, [{ ok: true }]);

        this.consul.agent.service.list(function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });
    });

    describe('register', function() {
      it('should work (http)', function(done) {
        this.nock
          .put('/v1/agent/service/register', {
            ID: '123',
            Name: 'service',
            Tags: ['web'],
            Check: {
              HTTP: 'http://example.org/',
              Interval: '5s',
              Notes: 'http service check',
              Status: 'critical',
            },
            Address: '10.0.0.1',
            Port: 80,
          })
          .reply(200);

        var opts = {
          id: '123',
          name: 'service',
          tags: ['web'],
          check: {
            http: 'http://example.org/',
            interval: '5s',
            notes: 'http service check',
            status: 'critical',
          },
          address: '10.0.0.1',
          port: 80,
        };

        this.consul.agent.service.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work (script)', function(done) {
        this.nock
          .put('/v1/agent/service/register', {
            Name: 'service',
            Check: {
              Script: 'true',
              Interval: '5s',
            },
          })
          .reply(200);

        var opts = {
          name: 'service',
          check: {
            script: 'true',
            interval: '5s',
          },
        };

        this.consul.agent.service.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work (ttl)', function(done) {
        this.nock
          .put('/v1/agent/service/register', {
            ID: '123',
            Name: 'service',
            Check: {
              TTL: '10s',
              Notes: 'ttl service check',
            },
          })
          .reply(200);

        var opts = {
          id: '123',
          name: 'service',
          check: {
            ttl: '10s',
            notes: 'ttl service check',
          },
        };

        this.consul.agent.service.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with multiple checks', function(done) {
        this.nock
          .put('/v1/agent/service/register', {
            ID: '123',
            Name: 'service',
            Checks: [
              { TTL: '10s' },
              { HTTP: 'http://127.0.0.1:8000', Interval: '60s' },
            ],
          })
          .reply(200);

        var opts = {
          id: '123',
          name: 'service',
          checks: [
            { ttl: '10s' },
            { http: 'http://127.0.0.1:8000', interval: '60s' },
          ],
        };

        this.consul.agent.service.register(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with only name', function(done) {
        this.nock
          .put('/v1/agent/service/register', { Name: 'service' })
          .reply(200);

        this.consul.agent.service.register('service', function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require valid check', function(done) {
        var opts = {
          name: 'service',
          check: {},
        };

        this.consul.agent.service.register(opts, function(err) {
          should(err).property('message',
            'consul: agent.service.register: http/tcp/script and interval, or ttl required');

          done();
        });
      });

      it('should require name', function(done) {
        this.consul.agent.service.register({}, function(err) {
          should(err).property('message', 'consul: agent.service.register: name required');

          done();
        });
      });
    });

    describe('deregister', function() {
      it('should work', function(done) {
        this.nock
          .put('/v1/agent/service/deregister/123')
          .reply(200);

        var opts = { id: '123' };

        this.consul.agent.service.deregister(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with just id', function(done) {
        this.nock
          .put('/v1/agent/service/deregister/123')
          .reply(200);

        this.consul.agent.service.deregister('123', function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require id', function(done) {
        this.consul.agent.service.deregister({}, function(err) {
          should(err).property('message', 'consul: agent.service.deregister: id required');

          done();
        });
      });
    });

    describe('maintaince', function() {
      it('should work', function(done) {
        this.nock
          .put('/v1/agent/service/maintenance/123?enable=true')
          .reply(200);

        var opts = { id: 123, enable: true };

        this.consul.agent.service.maintenance(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should work with reason', function(done) {
        this.nock
          .put('/v1/agent/service/maintenance/123?enable=false&reason=test')
          .reply(200);

        var opts = { id: 123, enable: false, reason: 'test' };

        this.consul.agent.service.maintenance(opts, function(err) {
          should.not.exist(err);

          done();
        });
      });

      it('should require id', function(done) {
        this.consul.agent.service.maintenance({}, function(err) {
          should(err).have.property('message', 'consul: agent.service.maintenance: id required');
          should(err).have.property('isValidation', true);

          done();
        });
      });

      it('should require enable', function(done) {
        this.consul.agent.service.maintenance({ id: 123 }, function(err) {
          should(err).have.property('message',
            'consul: agent.service.maintenance: enable required');
          should(err).have.property('isValidation', true);

          done();
        });
      });
    });
  });

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
