'use strict';

/**
 * Module dependencies.
 */

var bluebird = require('bluebird');
var lodash = require('lodash');
var papi = require('papi');
var should = require('should');

var consul = require('../lib');

var helper = require('./helper');

/**
 * Tests
 */

describe('Consul', function() {
  helper.setup(this);

  it('should work', function() {
    helper.consul().should.not.have.property('_defaults');

    helper.consul({ defaults: { foo: 'bar' } }).should.not.have.property('_defaults');

    helper.consul({ defaults: { token: '123' } }).should.have.property('_defaults').eql({
      token: '123',
    });

    helper.consul({
      defaults: { token: '123', dc: 'test', foo: 'bar' },
    }).should.have.property('_defaults').eql({
      token: '123',
      dc: 'test',
    });

    helper.consul()._opts.baseUrl.should.eql({
      protocol: 'http:',
      auth: null,
      port: '8500',
      hostname: '127.0.0.1',
      path: '/v1',
    });

    helper.consul({
      host: '127.0.0.2',
      port: '8501',
      secure: true,
    })._opts.baseUrl.should.eql({
      protocol: 'https:',
      auth: null,
      port: '8501',
      hostname: '127.0.0.2',
      path: '/v1',
    });

    helper.consul({
      baseUrl: 'https://user:pass@example.org:8502/proxy/v1',
    })._opts.baseUrl.should.eql({
      protocol: 'https:',
      auth: 'user:pass',
      port: '8502',
      hostname: 'example.org',
      path: '/proxy/v1',
    });
  });

  it('should not mutate options', function() {
    var opts = { test: 'opts' };
    var client = helper.consul(opts);

    client._opts.should.not.exactly(opts);
    client._opts.should.containEql({ test: 'opts' });
    client._opts.test = 'fail';

    opts.should.eql({ test: 'opts' });
  });

  describe('walk', function() {
    it('should work', function() {
      var setup = function(tree, depth, data) {
        data = data || [];

        var prefix = lodash.repeat(' ', depth);

        data.push(prefix + tree.name);

        lodash.each(tree.methods, function(method) {
          data.push(prefix + ' - ' + method.name + ' (' + method.type + ')');
        });

        lodash.each(tree.objects, function(tree) {
          setup(tree, depth + 1, data);
        });

        return data;
      };

      setup(consul.walk(), 0).should.eql([
        'Consul',
        ' - lock (eventemitter)',
        ' - watch (eventemitter)',
        ' - walk (sync)',
        ' - parseQueryMeta (sync)',
        ' Acl',
        '  - bootstrap (callback)',
        '  - create (callback)',
        '  - update (callback)',
        '  - destroy (callback)',
        '  - info (callback)',
        '  - get (callback)',
        '  - clone (callback)',
        '  - list (callback)',
        ' Agent',
        '  - checks (callback)',
        '  - services (callback)',
        '  - members (callback)',
        '  - self (callback)',
        '  - maintenance (callback)',
        '  - join (callback)',
        '  - forceLeave (callback)',
        '  Check',
        '   - list (callback)',
        '   - register (callback)',
        '   - deregister (callback)',
        '   - pass (callback)',
        '   - warn (callback)',
        '   - fail (callback)',
        '  Service',
        '   - list (callback)',
        '   - register (callback)',
        '   - deregister (callback)',
        '   - maintenance (callback)',
        ' Catalog',
        '  - datacenters (callback)',
        '  - nodes (callback)',
        '  - services (callback)',
        '  Node',
        '   - list (callback)',
        '   - services (callback)',
        '  Service',
        '   - list (callback)',
        '   - nodes (callback)',
        ' Event',
        '  - fire (callback)',
        '  - list (callback)',
        ' Health',
        '  - node (callback)',
        '  - checks (callback)',
        '  - service (callback)',
        '  - state (callback)',
        ' Kv',
        '  - get (callback)',
        '  - keys (callback)',
        '  - set (callback)',
        '  - del (callback)',
        '  - delete (alias)',
        ' Lock',
        '  - acquire (sync)',
        '  - release (sync)',
        ' Query',
        '  - list (callback)',
        '  - create (callback)',
        '  - get (callback)',
        '  - update (callback)',
        '  - destroy (callback)',
        '  - execute (callback)',
        '  - explain (callback)',
        ' Session',
        '  - create (callback)',
        '  - destroy (callback)',
        '  - info (callback)',
        '  - get (callback)',
        '  - node (callback)',
        '  - list (callback)',
        '  - renew (callback)',
        ' Status',
        '  - leader (callback)',
        '  - peers (callback)',
        ' Watch',
        '  - isRunning (sync)',
        '  - updateTime (sync)',
        '  - end (sync)',
      ]);
    });
  });

  describe('parseQueryMeta', function() {
    it('should work', function() {
      consul.parseQueryMeta().should.eql({});
      consul.parseQueryMeta({}).should.eql({});
      consul.parseQueryMeta({ headers: {} }).should.eql({});
      consul.parseQueryMeta({
        headers: {
          'x-consul-index': '5',
          'x-consul-lastcontact': '100',
          'x-consul-knownleader': 'true',
          'x-consul-translate-addresses': 'true',
        },
      }).should.eql({
        LastIndex: '5',
        LastContact: 100,
        KnownLeader: true,
        AddressTranslationEnabled: true,
      });
    });
  });

  describe('promisify', function() {
    before(function() {
      this.client = helper.consul({ promisify: bluebird.fromCallback });
    });

    it('should prefix error message', function() {
      this.sinon.stub(papi.tools, 'promisify', function() {
        throw new Error('test');
      });

      should(function() {
        helper.consul({ promisify: true });
      }).throw('promisify: test');
    });

    describe('default', function() {
      it('should work', function() {
        if (global.Promise) {
          helper.consul({ promisify: true });
        } else {
          should(function() {
            helper.consul({ promisify: true });
          }).throw('promisify: wrapper required');
        }
      });
    });

    describe('callback', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/status/leader')
          .reply(200, { ok: true });

        this.client.status.leader(function(err, data) {
          should.not.exist(err);

          should(data).eql({ ok: true });

          done();
        });
      });

      it('should get error', function(done) {
        this.nock
          .get('/v1/status/leader')
          .reply(500);

        this.client.status.leader(function(err) {
          should(err).have.property('message', 'internal server error');

          done();
        });
      });
    });

    describe('promise', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/status/leader')
          .reply(200, { ok: true });

        this.client.status.leader().then(function(data) {
          should(data).eql({ ok: true });

          done();
        });
      });

      it('should get error', function(done) {
        this.nock
          .get('/v1/status/leader')
          .reply(500);

        this.client.status.leader().catch(function(err) {
          should(err).have.property('message', 'internal server error');

          done();
        });
      });
    });
  });
});
