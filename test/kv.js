'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Kv', function() {
  helper.setup(this);

  describe('get', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/kv/key1')
        .reply(200, [{ ok: true }]);

      var opts = { key: 'key1' };

      this.consul.kv.get(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should return raw', function(done) {
      this.nock
        .get('/v1/kv/key1?raw=true')
        .reply(200, 'value1');

      var opts = {
        key: 'key1',
        raw: true,
      };

      this.consul.kv.get(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql(new Buffer('value1'));

        done();
      });
    });

    it('should return handle not found', function(done) {
      this.nock
        .get('/v1/kv/key1')
        .reply(404, 'value1');

      this.consul.kv.get('key1', function(err, data) {
        should.not.exist(err);
        should.not.exist(data);

        done();
      });
    });

    it('should decode values', function(done) {
      this.nock
        .get('/v1/kv/?recurse=true')
        .reply(200, [{ Value: 'dmFsdWUx' }, { ok: true }]);

      var opts = { recurse: true };

      this.consul.kv.get(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([
          { Value: 'value1' },
          { ok: true },
        ]);

        done();
      });
    });

    it('should empty response', function(done) {
      this.nock
        .get('/v1/kv/?recurse=true')
        .reply(200, []);

      var opts = { recurse: true };

      this.consul.kv.get(opts, function(err, data) {
        should.not.exist(err);
        should.not.exist(data);

        done();
      });
    });

    it('should handle errors', function(done) {
      this.nock
        .get('/v1/kv/key1')
        .reply(500);

      this.consul.kv.get('key1', function(err) {
        should(err).have.property('message', 'consul: kv.get: internal server error');

        done();
      });
    });
  });

  describe('keys', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/kv/key1?keys=true&separator=%3A')
        .reply(200, ['test']);

      var opts = { key: 'key1', separator: ':' };

      this.consul.kv.keys(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql(['test']);

        done();
      });
    });

    it('should work string argument', function(done) {
      this.nock
        .get('/v1/kv/key1?keys=true')
        .reply(200, ['test']);

      this.consul.kv.keys('key1', function(err, data) {
        should.not.exist(err);

        should(data).eql(['test']);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/kv/?keys=true')
        .reply(200, ['test']);

      this.consul.kv.keys(function(err, data) {
        should.not.exist(err);

        should(data).eql(['test']);

        done();
      });
    });
  });

  describe('set', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/kv/key1?cas=1&flags=2&acquire=session', 'value1')
        .reply(200, { ok: true });

      var opts = {
        key: 'key1',
        value: 'value1',
        cas: 1,
        flags: 2,
        acquire: 'session',
      };

      this.consul.kv.set(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with 4 arguments', function(done) {
      this.nock
        .put('/v1/kv/key1?release=session', '')
        .reply(200, { ok: true });

      var opts = { release: 'session' };

      this.consul.kv.set('key1', null, opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with 3 arguments', function(done) {
      this.nock
        .put('/v1/kv/key1', 'value1')
        .reply(200, { ok: true });

      this.consul.kv.set('key1', 'value1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require key', function(done) {
      this.consul.kv.set({}, function(err) {
        should(err).have.property('message', 'consul: kv.set: key required');

        done();
      });
    });

    it('should require value', function(done) {
      this.consul.kv.set({ key: 'key1' }, function(err) {
        should(err).have.property('message', 'consul: kv.set: value required');

        done();
      });
    });
  });

  describe('del', function() {
    it('should work', function(done) {
      this.nock
        .delete('/v1/kv/key1?cas=1')
        .reply(200);

      var opts = { key: 'key1', cas: 1 };

      this.consul.kv.del(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with string', function(done) {
      this.nock
        .delete('/v1/kv/key1')
        .reply(200);

      this.consul.kv.del('key1', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work support recurse', function(done) {
      this.nock
        .delete('/v1/kv/?recurse=true')
        .reply(200);

      var opts = { recurse: true };

      this.consul.kv.del(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });
  });
});
