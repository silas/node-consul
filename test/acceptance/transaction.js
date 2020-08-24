'use strict';

/**
 * Module dependencies.
 */

var async = require('async');
var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

helper.describe('Transaction', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  beforeEach(function(done) {
    var c = this.c1;
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

  describe('transaction', function() {
    it('should create two kv pairs', function(done) {
      var c = this.c1;
      var key1 = 'key1';
      var value1 = 'value1';
      var key2 = 'key2';
      var value2 = 'value2';

      c.transaction.create([
        {
          KV: {
            Verb: 'set',
            Key: key1,
            Value: Buffer.from(value1).toString('base64')
          }
        },{
          KV: {
            Verb: 'set',
            Key: key2,
            Value: Buffer.from(value2).toString('base64')
          }
        }
      ], function(err, ok, msg) {
        should.not.exist(err);

        ok.should.be.true;

        c.kv.get(key1, function(err, data) {
          should.not.exist(err);

          data.should.have.keys(
            'CreateIndex',
            'ModifyIndex',
            'LockIndex',
            'Key',
            'Flags',
            'Value'
          );
          data.Value.should.eql(value1);

          c.kv.get(key2, function(err, data) {
            should.not.exist(err);

            data.should.have.keys(
              'CreateIndex',
              'ModifyIndex',
              'LockIndex',
              'Key',
              'Flags',
              'Value'
            );
            data.Value.should.eql(value2);

            done();
          });
        });
      });
    });
  });
});
