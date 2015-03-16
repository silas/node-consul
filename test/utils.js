'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var utils = require('../lib/utils');

/**
 * Tests
 */

describe('utils', function() {
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
        this.one_two = 'onetwo';
      };
      Obj.prototype.hello = function() {
        this.MyValue = 'myvalue';
      };

      var obj = new Obj();

      obj.hello();
      obj.TWO_ONE = 'twoone';
      obj.Value = 'value';

      utils.normalizeKeys(obj).should.eql({
        onetwo: 'onetwo',
        twoone: 'twoone',
        value: 'value',
        myvalue: 'myvalue',
      });
    });
  });

  describe('options', function() {
    it('should work', function() {
      var test = function(opts) {
        var req = {};
        utils.options(req, opts);
        return req;
      };

      test({}).should.eql({ query: {} });
      test({ stale: true }).should.eql({ query: { stale: '1' } });
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

  describe('parseDuration', function() {
    it('should work', function() {
      should(utils.parseDuration()).be.undefined;
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
    });
  });
});
