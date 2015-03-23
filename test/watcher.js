'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Watcher', function() {
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

    watch._wait = function() { return 1; };

    var errors = [];
    var list = [];

    watch.on('error', function(err) {
      errors.push(err);
    });

    watch.on('cancel', function() {
      should(list).eql([1, 4, 5]);

      watch._run();
      watch._err();

      watch.end();
      should(watch.isRunning()).be.false;

      done();
    });

    should(watch.isRunning()).be.true;
    should(watch.updateTime()).be.undefined;

    watch.on('change', function(data, res) {
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
  });

  it('should require method', function(done) {
    this.consul.watch().on('error', function(err) {
      should(err).have.property('message', 'method is required');

      done();
    });
  });

  describe('wait', function() {
    it('should work', function() {
      var watch = this.consul.watch();
      watch.on('error', function() {});

      should(watch._wait()).equal(200);
      should(watch._wait()).equal(400);
      should(watch._wait()).equal(800);
      should(watch._wait()).equal(1600);
      should(watch._wait()).equal(3200);

      for (var i = 0; i < 100; i++) {
        should(watch._wait()).be.below(25601);
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
