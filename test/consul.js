'use strict';

/* jshint expr: true */

/**
 * Module dependencies.
 */

var async = require('async');
var should = require('should');

var Consul = require('../lib/consul').Consul;

/**
 * Tests
 */

describe('Consul', function() {
  before(function() {
    this.c = new Consul();
  });

  describe('constructor', function() {
    it('should have vaild defaults', function() {
      this.c.host.should.eql('localhost');
      this.c.httpPort.should.eql('8500');
    });
  });

  describe('kv', function() {
    beforeEach(function(done) {
      var c = this.c;
      var key = this.key = 'hello';
      var value = this.value = 'world';

      var jobs = [];

      jobs.push(function(cb) {
        c.kv.del({ recurse: true }, function() {
          cb();
        });
      });

      jobs.push(function(cb) {
        c.kv.set(key, value, function(err, ok) {
          if (err) return cb(err);
          if (!ok) return cb(new Error('not setup'));
          cb();
        });
      });

      async.series(jobs, function(err) {
        if (err) done(err);
        done();
      });
    });

    describe('get', function() {
      it('should return one kv pair', function(done) {
        var key = this.key;
        var value = this.value;

        this.c.kv.get(key, function(err, data) {
          should.not.exist(err);

          data.should.have.properties(
            'CreateIndex',
            'ModifyIndex',
            'Key',
            'Flags',
            'Value'
          );
          data.Key.should.eql(key);
          data.Flags.should.eql(0);
          data.Value.should.eql(value);

          done();
        });
      });

      it('should return no kv pair', function(done) {
        this.c.kv.get('none', function(err, data) {
          should.not.exist(err);
          should.not.exist(data);

          done();
        });
      });

      it('should return list of kv pairs', function(done) {
        var key = this.key;
        var value = this.value;

        this.c.kv.get({ recurse: true }, function(err, data) {
          should.not.exist(err);

          data.should.be.instanceof(Array);
          data.length.should.eql(1);

          var item = data[0];
          item.should.have.properties(
            'CreateIndex',
            'ModifyIndex',
            'Key',
            'Flags',
            'Value'
          );
          item.Key.should.eql(key);
          item.Flags.should.eql(0);
          item.Value.should.eql(value);

          done();
        });
      });

      it('should wait for update', function(done) {
        var c = this.c;
        var key = this.key;
        var update = 'new-value';

        var jobs = {};

        jobs.get = function(cb) {
          c.kv.get(key, function(err, data) {
            should.not.exist(err);

            cb(null, data);
          });
        };

        jobs.wait = ['get', function(cb, result) {
          var options = {
            key: key,
            index: result.get.ModifyIndex,
            wait: '3s'
          };

          c.kv.get(options, function(err, data) {
            should.not.exist(err);

            data.Value.should.eql(update);

            cb();
          });
        }];

        jobs.update = ['get', function(cb) {
          c.kv.set(key, update, function(err) {
            should.not.exist(err);

            cb();
          });
        }];

        async.auto(jobs, function(err) {
          should.not.exist(err);

          done();
        });
      });
    });

    describe('set', function() {
      it('should create kv pair', function(done) {
        var c = this.c;
        var key = 'one';
        var value = 'two';

        c.kv.set(key, value, function(err, ok) {
          should.not.exist(err);

          ok.should.be.true;

          c.kv.get(key, function(err, data) {
            should.not.exist(err);

            data.should.have.property('Value');
            data.Value.should.eql(value);

            done();
          });
        });
      });
    });

    describe('del', function() {
      it('should delete kv pair', function(done) {
        var c = this.c;
        var key = this.key;

        c.kv.del(key, function(err) {
          should.not.exist(err);

          c.kv.get(key, function(err, data) {
            should.not.exist(err);
            should.not.exist(data);

            done();
          });
        });
      });
    });
  });
});
