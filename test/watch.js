'use strict';

/**
 * Module dependencies.
 */

var lodash = require('lodash');
var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Watch', function() {
  helper.setup(this);

  it('should work', function(done) {
    this.nock
      .get('/v1/kv/key1?index=0&wait=30s')
      .reply(200, [{ n: 1 }], { 'X-Consul-Index': '5' })
      .get('/v1/kv/key1?index=5&wait=30s')
      .reply(200, [{ n: 2 }], { 'X-Consul-Index': '5' })
      .get('/v1/kv/key1?index=5&wait=30s')
      .reply(500, [{ n: 3 }])
      .get('/v1/kv/key1?index=5&wait=30s')
      .reply(200, [{ n: 4 }], { 'X-Consul-Index': '10' })
      .get('/v1/kv/key1?index=10&wait=30s')
      .reply(200, [{ n: 5 }], { 'X-Consul-Index': '15' })
      .get('/v1/kv/key1?index=15&wait=30s')
      .reply(400);

    var watch = this.consul.watch({
      method: this.consul.kv.get,
      options: { key: 'key1' },
    });

    should(watch.isRunning()).be.true;
    should(watch.updateTime()).be.undefined;

    // make tests run fast
    watch._wait = function() { return 1; };

    var errors = [];
    var list = [];
    var called = {};

    watch.on('error', function(err) {
      called.error = true;

      errors.push(err);
    });

    watch.on('cancel', function() {
      called.cancel = true;

      should(list).eql([1, 4, 5]);

      watch._run();
      watch._err();

      watch.end();
      should(watch.isRunning()).be.false;
    });

    watch.on('change', function(data, res) {
      called.change = true;

      list.push(data.n);

      switch (res.headers['x-consul-index']) {
        case '5':
          should(watch.isRunning()).be.true;
          should(watch.updateTime()).be.a.number;
          should(errors).be.empty;
          break;
        case '10':
          should(watch.isRunning()).be.true;
          should(watch.updateTime()).be.a.number;
          should(errors).have.length(1);
          should(errors[0]).have.property('message', 'consul: kv.get: internal server error');
          break;
        case '15':
          break;
        default:
          break;
      }
    });

    watch.on('end', function() {
      called.should.have.property('cancel', true);
      called.should.have.property('change', true);
      called.should.have.property('error', true);

      done();
    });
  });

  it('should error when endpoint does not support watch', function(done) {
    this.nock
      .get('/v1/agent/members?index=0&wait=30s')
      .reply(200, [{ n: 1 }]);

    var watch = this.consul.watch({
      method: this.consul.agent.members,
    });

    var errors = [];
    var called = {};

    watch.on('error', function(err) {
      called.error = true;

      errors.push(err);
    });

    watch.on('cancel', function() {
      called.cancel = true;
    });

    watch.on('change', function() {
      called.change = true;
    });

    watch.on('end', function() {
      called.should.eql({ cancel: true, error: true });
      should(errors).have.length(1);
      errors[0].should.have.property('isValidation', true);
      errors[0].should.have.property('message', 'Watch not supported');

      done();
    });
  });

  it('should use maxAttempts', function(done) {
    this.nock
      .get('/v1/kv/key1?index=0&wait=30s')
      .reply(500)
      .get('/v1/kv/key1?index=0&wait=30s')
      .reply(500);

    var watch = this.consul.watch({
      method: this.consul.kv.get,
      options: { key: 'key1' },
      backoffFactor: 0,
      maxAttempts: 2,
    });

    should(watch.isRunning()).be.true;
    should(watch.updateTime()).be.undefined;

    var errors = [];

    watch.on('error', function(err) {
      errors.push(err);
    });

    watch.on('end', function() {
      should(errors).have.length(3);

      done();
    });
  });

  it('should require method', function() {
    var self = this;

    should(function() {
      self.consul.watch({});
    }).throw('method required');
  });

  describe('wait', function() {
    it('should work', function() {
      var watch = this.consul.watch({ key: 'test', method: lodash.noop });

      should(watch._wait()).equal(200);
      should(watch._wait()).equal(400);
      should(watch._wait()).equal(800);
      should(watch._wait()).equal(1600);
      should(watch._wait()).equal(3200);

      for (var i = 0; i < 100; i++) {
        should(watch._wait()).be.below(30001);
      }
    });

    it('should use custom backoff settings', function() {
      var watch = this.consul.watch({
        key: 'test',
        method: lodash.noop,
        backoffFactor: 500,
        backoffMax: 20000
      });

      should(watch._wait()).equal(1000);
      should(watch._wait()).equal(2000);
      should(watch._wait()).equal(4000);
      should(watch._wait()).equal(8000);
      should(watch._wait()).equal(16000);

      for (var i = 0; i < 100; i++) {
        should(watch._wait()).be.below(20001);
      }
    });
  });

  describe('err', function(done) {
    it('should handle method throw', function() {
      var watch = this.consul.watch({
        method: function() { throw new Error('ok'); },
      });

      watch.on('error', function(err) {
        if (err.message === 'ok') {
          done();
        }
      });
    });
  });
});
