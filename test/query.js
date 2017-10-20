'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Query', function() {
  helper.setup(this);

  describe('list', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/query')
        .reply(200, { ok: true }, { 'x-consul-token': 'token1' });

      this.consul.query.list({ token: 'token1' }, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with no options', function(done) {
      this.nock
        .get('/v1/query')
        .reply(200, { ok: true });

      this.consul.query.list(function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });
  });

  describe('create', function() {
    it('should work', function(done) {
      this.nock
        .post('/v1/query', {
          Name: 'name1',
          Session: 'session1',
          Token: 'token1',
          Near: 'near1',
          Template: {
            Type: 'type1',
            Regexp: 'regexp1',
          },
          Service: {
            Service: 'service1',
            Failover: {
              NearestN: 2,
              Datacenters: ['dc1'],
            },
            OnlyPassing: true,
            Tags: ['tag1'],
          },
          DNS: {
            TTL: '9s',
          },
        })
        .reply(200, { ok: true });

      var opts = {
        name: 'name1',
        session: 'session1',
        token: 'token1',
        near: 'near1',
        template: {
          type: 'type1',
          regexp: 'regexp1',
        },
        service: {
          service: 'service1',
          failover: {
            nearestn: 2,
            datacenters: ['dc1'],
          },
          onlypassing: true,
          tags: ['tag1'],
        },
        dns: {
          ttl: '9s',
        },
      };

      this.consul.query.create(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with just service', function(done) {
      this.nock
        .post('/v1/query', {
          Service: {
            Service: 'service1',
          },
        })
        .reply(200, { ok: true });

      this.consul.query.create('service1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require service', function(done) {
      this.consul.query.create({}, function(err) {
        should(err).have.property('message', 'consul: query.create: service required');

        done();
      });
    });
  });

  describe('get', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/query/query1')
        .reply(200, [{ ok: true }]);

      this.consul.query.get('query1', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require query', function(done) {
      this.consul.query.get({}, function(err) {
        should(err).have.property('message', 'consul: query.get: query required');

        done();
      });
    });
  });

  describe('update', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/query/query1', {
          Name: 'name1',
          Session: 'session1',
          Token: 'token1',
          Near: 'near1',
          Template: {
            Type: 'type1',
            Regexp: 'regexp1',
          },
          Service: {
            Service: 'service1',
            Failover: {
              NearestN: 2,
              Datacenters: ['dc1'],
            },
            OnlyPassing: true,
            Tags: ['tag1'],
          },
          DNS: {
            TTL: '9s',
          },
        })
        .reply(200);

      var opts = {
        query: 'query1',
        name: 'name1',
        session: 'session1',
        token: 'token1',
        near: 'near1',
        template: {
          type: 'type1',
          regexp: 'regexp1',
        },
        service: {
          service: 'service1',
          failover: {
            nearestn: 2,
            datacenters: ['dc1'],
          },
          onlypassing: true,
          tags: ['tag1'],
        },
        dns: {
          ttl: '9s',
        },
      };

      this.consul.query.update(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require query', function(done) {
      this.consul.query.update(function(err) {
        should(err).have.property('message', 'consul: query.update: query required');

        done();
      });
    });

    it('should require service', function(done) {
      this.consul.query.update({ query: 'query1', service: {} }, function(err) {
        should(err).have.property('message', 'consul: query.update: service required');

        done();
      });
    });
  });

  describe('destroy', function() {
    it('should work', function(done) {
      this.nock
        .delete('/v1/query/query1')
        .reply(200, { ok: true });

      this.consul.query.destroy('query1', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require query', function(done) {
      this.consul.query.destroy({}, function(err) {
        should(err).have.property('message', 'consul: query.destroy: query required');

        done();
      });
    });
  });

  describe('execute', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/query/query1/execute')
        .reply(200, { ok: true });

      this.consul.query.execute('query1', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require query', function(done) {
      this.consul.query.execute({}, function(err) {
        should(err).have.property('message', 'consul: query.execute: query required');

        done();
      });
    });
  });

  describe('explain', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/query/query1/explain')
        .reply(200, { ok: true });

      this.consul.query.explain('query1', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require query', function(done) {
      this.consul.query.explain({}, function(err) {
        should(err).have.property('message', 'consul: query.explain: query required');

        done();
      });
    });
  });

  describe('params', function() {
    it('should work', function() {
      var req = {};
      var opts = {
        name: 'name1',
        session: 'session1',
        token: 'token1',
        near: 'near1',
        template: {
          regexp: 'regexp1',
        },
        service: {
          service: 'service1',
          failover: {
            datacenters: ['dc1'],
          },
          onlypassing: true,
          tags: ['tag1'],
        },
        dns: {
          ttl: '9s',
        },
      };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Name: 'name1',
          Session: 'session1',
          Token: 'token1',
          Near: 'near1',
          Template: {
            Regexp: 'regexp1',
          },
          Service: {
            Service: 'service1',
            Failover: {
              Datacenters: ['dc1'],
            },
            OnlyPassing: true,
            Tags: ['tag1'],
          },
          DNS: {
            TTL: '9s',
          },
        },
      });

      req = {};
      opts = {
        template: { type: 'type1' },
        service: {
          service: 'service1',
          failover: { nearestn: 0 },
        },
      };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Template: { Type: 'type1' },
          Service: {
            Service: 'service1',
            Failover: { NearestN: 0 },
          },
        },
      });

      req = {};
      opts = {
        template: {},
        service: {
          failover: {},
        },
        dns: {},
      };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Service: {},
        },
      });
    });

    it('should handle token', function() {
      var req = {};
      var opts = { service: { service: 'service1' }, token: 'token1' };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Token: 'token1',
          Service: {
            Service: 'service1',
          },
        }
      });
    });
  });
});
