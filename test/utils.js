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
});
