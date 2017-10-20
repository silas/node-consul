'use strict';

/**
 * Module dependencies.
 */

var events = require('events');
var should = require('should');

var utils = require('../lib/utils');

var helper = require('./helper');

/**
 * Tests
 */

describe('utils', function() {
  helper.setup(this);

  describe('body', function() {
    it('should work', function() {
      utils.body({ err: null, res: { body: 'body' } }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal(undefined);
        should(arguments[2]).equal('body');
        should(arguments[3]).eql({ body: 'body' });
      });

      utils.body({ err: 'err', res: { body: 'body' } }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal('err');
        should(arguments[2]).equal(undefined);
        should(arguments[3]).eql({ body: 'body' });
      });
    });
  });

  describe('bodyItem', function() {
    it('should work', function() {
      utils.bodyItem({ err: null, res: { body: ['body'] } }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal(undefined);
        should(arguments[2]).equal('body');
        should(arguments[3]).eql({ body: ['body'] });
      });

      utils.bodyItem({ err: null, res: { body: [] } }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal(undefined);
        should(arguments[2]).equal(undefined);
        should(arguments[3]).eql({ body: [] });
      });

      utils.bodyItem({ err: 'err', res: { body: ['body'] } }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal('err');
        should(arguments[2]).equal(undefined);
        should(arguments[3]).eql({ body: ['body'] });
      });
    });
  });

  describe('empty', function() {
    it('should work', function() {
      utils.empty({ err: null, res: 'res' }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal(undefined);
        should(arguments[2]).equal(undefined);
        should(arguments[3]).equal('res');
      });

      utils.empty({ err: 'err', res: 'res' }, function() {
        should(arguments[0]).equal(false);
        should(arguments[1]).equal('err');
        should(arguments[2]).equal(undefined);
        should(arguments[3]).equal('res');
      });
    });
  });

  describe('normalizeKeys', function() {
    it('should work', function() {
      utils.normalizeKeys().should.eql({});

      var Obj = function() {
        this.onetwo = 'onetwo';
        this.TWO_ONE = 'twoone';
        this.Value = 'value';
      };
      Obj.prototype.fail = 'yes';

      var obj = new Obj();

      utils.normalizeKeys(obj).should.eql({
        onetwo: 'onetwo',
        twoone: 'twoone',
        value: 'value',
      });
    });
  });

  describe('defaults', function() {
    it('should work', function() {
      utils.defaults().should.eql({});
      utils.defaults({}).should.eql({});
      utils.defaults({}, {}).should.eql({});
      utils.defaults({}, { hello: 'world' }).should.eql({ hello: 'world' });
      utils.defaults({ hello: 'world' }, {}).should.eql({ hello: 'world' });
      utils.defaults({ hello: 'world' }, { hello: 'test' }).should.eql({ hello: 'world' });
      utils.defaults({ hello: null }, { hello: 'test' }).should.eql({ hello: null });
      utils.defaults({ hello: undefined }, { hello: 'test' }).should.eql({ hello: undefined });
      utils.defaults(
        { one: 1 },
        { two: 2, one: 'nope' },
        { three: 3, two: 'nope' },
        { three: 'nope' }
      ).should.eql({ one: 1, two: 2, three: 3 });
    });
  });

  describe('options', function() {
    it('should work', function() {
      var test = function(opts, req) {
        if (req === undefined) req = {};
        utils.options(req, opts);
        return req;
      };

      test().should.eql({ query: {} });
      test({}).should.eql({ query: {} });
      test({ stale: true }).should.eql({ query: { stale: '1' } });
      test({}, { query: { hello: 'world' } }).should.eql({ query: { hello: 'world' } });
      test({
        dc: 'dc1',
        wan: true,
        consistent: true,
        index: 10,
        wait: '10s',
        token: 'token1',
        near: '_agent',
        'node-meta': ['a:b', 'c:d'],
        ctx: 'ctx',
        timeout: 20,
      }).should.eql({
        query: {
          dc: 'dc1',
          wan: '1',
          consistent: '1',
          index: 10,
          wait: '10s',
          token: 'token1',
          near: '_agent',
          'node-meta': ['a:b', 'c:d'],
        },
        ctx: 'ctx',
        timeout: 20,
      });
    });
  });

  describe('decode', function() {
    it('should work', function() {
      should(utils.decode(null)).equal(null);
      should(utils.decode()).equal(undefined);
      should(utils.decode('')).equal('');
      should(utils.decode('aGVsbG8gd29ybGQ=')).equal('hello world');
      should(utils.decode('aGVsbG8gd29ybGQ=', {})).equal('hello world');
      should(utils.decode('aGVsbG8gd29ybGQ=', { buffer: true })).eql(new Buffer('hello world'));
    });
  });

  describe('clone', function() {
    it('should work', function() {
      var src = { hello: 'world' };
      var dst = utils.clone(src);

      dst.should.eql({ hello: 'world' });
      dst.should.not.equal(src);

      var Obj = function() {
        this.hello = 'world';
      };
      Obj.prototype.fail = 'yes';

      src = new Obj();
      dst = utils.clone(src);

      dst.should.eql({ hello: 'world' });
      dst.should.not.equal(src);
    });
  });

  describe('parseDuration', function() {
    it('should work', function() {
      should(utils.parseDuration(0)).equal(0);
      should(utils.parseDuration(1000000)).equal(1);
      should(utils.parseDuration('0')).equal(0);
      should(utils.parseDuration('1000000')).equal(1);

      should(utils.parseDuration('1ns')).equal(1e-6);
      should(utils.parseDuration('1us')).equal(1e-3);
      should(utils.parseDuration('1ms')).equal(1);
      should(utils.parseDuration('1s')).equal(1e3);
      should(utils.parseDuration('1m')).equal(6e4);
      should(utils.parseDuration('1h')).equal(3.6e6);

      should(utils.parseDuration('.5s')).equal(500);
      should(utils.parseDuration('0.5s')).equal(500);
      should(utils.parseDuration('1.s')).equal(1000);
      should(utils.parseDuration('1.5s')).equal(1500);
      should(utils.parseDuration('10.03m')).equal(601800);

      should(utils.parseDuration()).be.undefined;
      should(utils.parseDuration('')).be.undefined;
      should(utils.parseDuration('.')).be.undefined;
      should(utils.parseDuration('10x')).be.undefined;
      should(utils.parseDuration('.ms')).be.undefined;
    });
  });

  describe('setTimeoutContext', function() {
    beforeEach(function() {
      this.ctx = new events.EventEmitter();
    });

    it('should cancel timeout', function(done) {
      var self = this;

      utils.setTimeoutContext(function() {
        throw new Error('should have been canceled');
      }, self.ctx, 10);

      self.ctx.on('cancel', function() {
        should(self.ctx.listeners('cancel')).have.length(1);

        done();
      });

      self.ctx.emit('cancel');
    });

    it('should remove cancel listener', function(done) {
      var self = this;

      utils.setTimeoutContext(function() {
        should(self.ctx.listeners('cancel')).have.length(0);

        done();
      }, self.ctx, 0);
    });
  });

  describe('setIntervalContext', function() {
    beforeEach(function() {
      this.ctx = new events.EventEmitter();
    });

    it('should cancel timeout', function(done) {
      var self = this;

      utils.setIntervalContext(function() {
        throw new Error('should have been canceled');
      }, self.ctx, 10);

      self.ctx.on('cancel', function() {
        should(self.ctx.listeners('cancel')).have.length(1);

        done();
      });

      self.ctx.emit('cancel');
    });
  });

  describe('createCheck', function() {
    it('should work', function() {
      should(utils.createCheck({
        ID: 'id',
        name: 'name',
        service_id: 'service',
        http: 'http://127.0.0.1:8000',
        timeout: '30s',
        interval: '60s',
        notes: 'Just a note.',
        status: 'passing',
      })).eql({
        ID: 'id',
        Name: 'name',
        ServiceID: 'service',
        HTTP: 'http://127.0.0.1:8000',
        Timeout: '30s',
        Interval: '60s',
        Notes: 'Just a note.',
        Status: 'passing',
      });

      should(utils.createCheck({
        ID: 'id',
        name: 'name',
        service_id: 'service',
        tcp: 'localhost:22',
        interval: '10s',
        notes: 'SSH TCP on port 22',
        status: 'passing',
        deregistercriticalserviceafter: '1h',
      })).eql({
        ID: 'id',
        Name: 'name',
        ServiceID: 'service',
        TCP: 'localhost:22',
        Interval: '10s',
        Notes: 'SSH TCP on port 22',
        Status: 'passing',
        DeregisterCriticalServiceAfter: '1h',
      });
    });
  });

  describe('createServiceCheck', function() {
    it('should work', function() {
      should(utils.createServiceCheck({
        script: '/usr/bin/true',
        interval: '30s',
        shell: '/bin/sh',
        dockercontainerid: '123',
      })).eql({
        Script: '/usr/bin/true',
        Interval: '30s',
        Shell: '/bin/sh',
        DockerContainerID: '123',
      });

      should(utils.createServiceCheck({
        ttl: '15s',
      })).eql({
        TTL: '15s',
      });
    });

    it('should require script, http, tcp, or ttl', function() {
      should(function() {
        utils.createCheck();
      }).throw('http/tcp/script and interval, or ttl required');
    });
  });

  describe('hasIndexChanged', function() {
    it('should work', function() {
      utils.hasIndexChanged().should.equal(false);
      utils.hasIndexChanged('').should.equal(false);
      utils.hasIndexChanged('1').should.equal(true);
      utils.hasIndexChanged('1', '').should.equal(true);
      utils.hasIndexChanged('10', '1').should.equal(true);
      utils.hasIndexChanged('0', '1').should.equal(true);
      utils.hasIndexChanged('1', '1').should.equal(false);
      utils.hasIndexChanged('1', '0').should.equal(true);
      utils.hasIndexChanged('2', '1').should.equal(true);
      utils.hasIndexChanged('2', '2').should.equal(false);
    });
  });
});
