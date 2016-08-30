'use strict';

/**
 * Module dependencies.
 */

var events = require('events');
var lodash = require('lodash');
var should = require('should');

var consul = require('../lib');

var helper = require('./helper');

/**
 * Variables
 */

var FLAGS_IN = '3304740253564472344';
var FLAGS_OUT = 0x2ddccbc058a50c18;

/**
 * Tests
 */

describe('Lock', function() {
  helper.setup(this);

  beforeEach(function() {
    var ctx = new events.EventEmitter();
    ctx.key = 'test';
    ctx.lockWaitTime = '15s';
    ctx.lockWaitTimeout = 16000;
    ctx.lockRetryTime = 5000;
    ctx.index = 0;
    ctx.session = { id: 'session123', ttl: '15s' };
    ctx.end = false;

    var lock = this.consul.lock({ key: ctx.key });
    lock._ctx = ctx;

    this.ctx = ctx;
    this.lock = lock;
  });

  describe('constructor', function() {
    it('should require valid options', function() {
      var self = this;

      var checks = [
        { opts: { session: true }, message: 'session must be an object or string' },
        { opts: { session: 'ok' }, message: 'key required' },
        { opts: { session: {} }, message: 'key required' },
        { opts: {}, message: 'key required' },
        { opts: { key: true }, message: 'key must be a string' },
      ];

      lodash.each(checks, function(check) {
        should(function() {
          self.consul.lock(check.opts);
        }).throw(check.message);
      });
    });
  });

  describe('acquire', function() {
    it('should create ctx', function(done) {
      delete this.lock._ctx;

      this.lock._run = function(ctx) {
        ctx.should.have.property('key', 'test');
        ctx.should.have.property('index', '0');
        ctx.should.have.property('end', false);
        ctx.should.have.property('lockWaitTime', '15s');
        ctx.should.have.property('lockWaitTimeout', 16000);
        ctx.should.have.property('lockRetryTime', 5000);
        ctx.should.have.property('state', 'session');
        ctx.should.have.property('value', null);

        done();
      };

      this.lock.acquire();
    });

    it('should error for activate lock', function() {
      var self = this;

      should(function() {
        self.lock.acquire();
      }).throw('lock in use');
    });
  });

  describe('release', function() {
    it('should require activate lock', function() {
      var self = this;

      delete self.lock._ctx;

      should(function() {
        self.lock.release();
      }).throw('no lock in use');
    });
  });

  describe('_err', function() {
    it('should emit error', function(done) {
      this.lock.once('error', function(err, res) {
        should(err).have.property('message', 'ok');
        should(res).equal('res');

        done();
      });

      this.lock._err(new Error('ok'), 'res');
    });
  });

  describe('_run', function() {
    it('should do nothing when ctx ended', function() {
      this.lock.on('end', function() {
        throw new Error('should not end');
      });

      this.ctx.end = true;
      this.lock._run(this.ctx);
    });

    it('should throw on unknown state', function() {
      var self = this;

      self.ctx.state = 'foo';

      should(function() {
        self.lock._run(self.ctx);
      }).throw('invalid state: foo');
    });
  });

  describe('_session', function() {
    beforeEach(function() {
      this.lock._run = function() {};
      this.ctx.session = { ttl: '100ms' };
    });

    it('should end when create fails', function(done) {
      this.nock
        .put('/v1/session/create')
        .reply(500);

      var error;

      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message', 'session create: internal server error');

        done();
      });

      this.lock._session(this.ctx);
    });

    it('should start session renew', function(done) {
      this.nock
        .put('/v1/session/create')
        .reply(200, { ID: '123' })
        .put('/v1/session/renew/123')
        .reply(200, {})
        .put('/v1/session/renew/123')
        .reply(500);

      var error;

      this.lock.once('error', function(err) {
        error = err;
      });

      this.lock.on('end', function() {
        should(error).have.property('message', 'internal server error');

        done();
      });

      this.lock._session(this.ctx);
    });
  });

  describe('_acquire', function() {
    it('should create key if it does not exist', function(done) {
      this.nock
        .put('/v1/kv/test?flags=' + FLAGS_IN + '&acquire=session123')
        .reply(503);

      var error = [];
      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message', 'service unavailable');

        done();
      });

      this.lock._acquire(this.ctx);
    });
  });

  describe('_wait', function() {
    it('should end when get fails', function(done) {
      this.nock
        .get('/v1/kv/test?index=0&wait=15s')
        .reply(500);

      var error = [];
      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message', 'consul: kv.get: internal server error');

        done();
      });

      this.lock._wait(this.ctx);
    });

    it('should end when flags is invalid', function(done) {
      this.nock
        .get('/v1/kv/test?index=0&wait=15s')
        .reply(200, [{ Flags: 123 }], { 'X-Consul-Index': '5' });

      var error;
      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message',
          'consul: lock: existing key does not match lock use');

        done();
      });

      this.lock._wait(this.ctx);
    });

    it('should end for non-empty/non-404 response', function(done) {
      this.nock
        .get('/v1/kv/test?index=0&wait=15s')
        .reply(200);

      var error;
      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message', 'consul: lock: error getting key');

        done();
      });

      this.lock._wait(this.ctx);
    });

    it('should acquire on success', function(done) {
      this.nock
        .get('/v1/kv/test?index=0&wait=15s')
        .reply(404);

      this.lock._run = function(ctx) {
        should(ctx).have.property('state', 'acquire');
        done();
      };

      this.lock._wait(this.ctx);
    });
  });

  describe('_monitor', function() {
    beforeEach(function() {
      this.ctx.key = 'test';
      this.ctx.lockWaitTime = '5ms';
      this.ctx.lockWaitTimeout = 10;
      this.ctx.session = { id: '123', ttl: '5ms' };
    });

    it('should end when session changes', function(done) {
      this.nock
        .get('/v1/kv/test?index=0&wait=5ms')
        .reply(200, [], { 'X-Consul-Index': '5' })
        .get('/v1/kv/test?index=5&wait=5ms')
        .reply(200, [{ Session: '123' }], { 'X-Consul-Index': '7' })
        .get('/v1/kv/test?index=7&wait=5ms')
        .reply(200, [{ Session: 'abc' }], { 'X-Consul-Index': '10' });

      this.ctx.session.ttl = '15s';

      this.lock.on('end', function() { done(); });
      this.lock._monitor(this.ctx);
    });

    it('should timeout when session ttl set', function(done) {
      var self = this;

      self.nock
        .get('/v1/kv/test?index=0&wait=5ms')
        .reply(200, [], { 'X-Consul-Index': '5' })
        .get('/v1/kv/test?index=5&wait=5ms')
        .reply(500)
        .get('/v1/kv/test?index=5&wait=5ms')
        .reply(200, [], { 'X-Consul-Index': '10' })
        .get('/v1/kv/test?index=10&wait=5ms')
        .delay(1000)
        .reply(200, [], { 'X-Consul-Index': '15' });

      self.ctx.session = { ttl: '10ms' };

      self.sinon.stub(consul.Watch.prototype, '_wait', function() {
        return 0;
      });

      var monitor;

      self.lock.on('end', function() {
        should(monitor._options).have.property('index', '10');

        done();
      });

      self.lock._monitor(self.ctx);

      monitor = self.ctx.monitor;
    });
  });

  describe('_end', function() {
    it('should only run once', function() {
      should(this.ctx).have.property('end', false);
      this.lock._end(this.ctx);
      should(this.ctx).have.property('end', true);
      this.lock._end(this.ctx);
      should(this.ctx).have.property('end', true);
    });
  });

  describe('_release', function() {
    it('should end on set failure', function(done) {
      this.nock
        .put('/v1/kv/test?flags=3304740253564472344&release=session123')
        .reply(500);

      this.ctx.held = true;

      var error;
      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message', 'internal server error');

        done();
      });

      this.lock._release(this.ctx);
    });

    it('should end when set returns false', function(done) {
      this.nock
        .put('/v1/kv/test?flags=3304740253564472344&release=session123')
        .reply(200);

      this.ctx.held = true;

      var error;
      this.lock.once('error', function(err) { error = err; });

      this.lock.on('end', function() {
        should(error).have.property('message', 'failed to release lock');

        done();
      });

      this.lock._release(this.ctx);
    });

    it('should not set release when not held', function(done) {
      this.lock.on('end', function() { done(); });
      this.lock._release(this.ctx);
    });
  });

  describe('integration', function() {
    it('should acquire and release lock', function(done) {
      this.nock
        .put('/v1/session/create', {
          Name: 'Consul API Lock',
          TTL: '15s',
          Node: 'node1',
        })
        .reply(200, { ID: 'session123' })
        .get('/v1/kv/test?index=0&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT, Session: 'abc' }], { 'X-Consul-Index': '5' })
        .get('/v1/kv/test?index=5&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT, Session: 'abc' }], {})
        .get('/v1/kv/test?index=5&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT }], { 'X-Consul-Index': '10' })
        .put('/v1/kv/test?flags=' + FLAGS_IN + '&acquire=session123')
        .reply(200, false)
        .get('/v1/kv/test?index=10&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT }], { 'X-Consul-Index': '15' })
        .put('/v1/kv/test?flags=' + FLAGS_IN + '&acquire=session123')
        .reply(200, true)
        .get('/v1/kv/test?index=15&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT }])
        .put('/v1/kv/test?flags=' + FLAGS_IN + '&release=session123')
        .reply(200, true);

      var lock = this.consul.lock({
        key: 'test',
        lockWaitTime: '5ms',
        lockRetryTime: '1ms',
        session: { node: 'node1' },
      });

      var acquire = 0;
      var release = 0;

      lock.on('acquire', function() { acquire++; lock.release(); });
      lock.on('release', function() { release++; });

      lock.on('end', function() {
        acquire.should.equal(1);
        release.should.equal(1);

        done();
      });

      lock.acquire();
    });

    it('should use provided string session', function(done) {
      this.nock
        .get('/v1/kv/test?index=0&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT }], { 'X-Consul-Index': '5' })
        .put('/v1/kv/test?flags=' + FLAGS_IN + '&acquire=session123')
        .reply(200, true)
        .get('/v1/kv/test?index=5&wait=5ms')
        .reply(200, [{ Flags: FLAGS_OUT }])
        .put('/v1/kv/test?flags=' + FLAGS_IN + '&release=session123')
        .reply(200, true);

      var lock = this.consul.lock({
        key: 'test',
        lockWaitTime: '5ms',
        lockRetryTime: '1ms',
        session: 'session123',
      });

      var acquire = 0;
      var release = 0;

      lock.on('acquire', function() { acquire++; lock.release(); });
      lock.on('release', function() { release++; });

      lock.on('end', function() {
        acquire.should.equal(1);
        release.should.equal(1);

        done();
      });

      lock.acquire();
    });
  });
});
