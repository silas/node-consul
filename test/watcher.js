'use strict';

/**
 * Module dependencies.
 */

var async = require('async');
var lodash = require('lodash');
var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Watcher', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  beforeEach(function(done) {
    var c = this.c1;

    c.kv.del({ recurse: true }, function(err) {
      done(err);
    });
  });

  it('should work', function(done) {
    var c = this.c1;

    var key = 'test';
    var count = 0;

    var changes = [];
    var errors = [];

    var watch = c.watch(c.kv.get, { key: key, wait: '1ms' });

    watch.on('change', function(data) {
      changes.push(data);
    });

    watch.on('error', function(err) {
      errors.push(err);
    });

    var jobs = [];

    jobs.push(function(next) {
      count++;
      c.kv.set(key, '1', next);
    });

    jobs.push(function(next) {
      count++;
      c.kv.set(key, '2', next);
    });

    jobs.push(function(next) {
      count++;
      c.kv.set(key, '3', next);
    });

    jobs.push(function(next) {
      count++;
      c.kv.del(key, next);
    });

    jobs.push(function(next) {
      async.until(
        function() { return changes.length === count + 1; },
        function(next) { setTimeout(next, 50); },
        next
      );
    });

    jobs.push(function(next) {
      var values = lodash.map(changes, function(data) {
        return data && data.Value;
      });

      values.should.eql([
        undefined,
        '1',
        '2',
        '3',
        undefined,
      ]);

      watch.end();
      watch._run();
      watch.end();

      next();
    });

    async.series(jobs, done);
  });

  it('should accept callback', function(done) {
    var c = this.c1;

    var key = 'test';

    c.watch(c.kv.get, { key: key }, function(err, data) {
      if (data && data.Value === 'test') {
        done();
      }
    });

    c.kv.set(key, 'test', function(err) {
      if (err) throw err;
    });
  });

  it('should not retry on 400 errors', function(done) {
    var c = this.c1;

    var errors = [];

    var watch = c.watch(c.kv.get, {});

    watch.on('error', function(err) {
      errors.push(err);
    });

    async.until(
      function() { return errors.length === 1; },
      function(next) { setTimeout(next, 50); },
      function(err) {
        if (err) return done(err);

        watch.should.have.property('_attempts', 0);
        watch.should.have.property('_end', true);

        done();
      }
    );
  });

  it('should require fn', function(done) {
    this.c1.watch(null, {}, function(err) {
      should(err).have.property('message', 'fn is required');

      done();
    });
  });

  it('should not retry on validation errors', function(done) {
    var watch = this.c1.watch(null, {});

    watch.on('error', function(err) {
      should(err).have.property('message', 'fn is required');

      done();
    });
  });

  it('should exponential retry', function(done) {
    var c = this.c1;

    var todo = ['one', 'two', 'three'];

    var fn = function(opts, callback) {
      var err = new Error(todo.shift());

      if (err.message === 'one') {
        throw err;
      }

      callback(err);
    };

    var oneErr, twoErr;
    var time = +new Date();

    var watch = c.watch(fn, {});

    watch.on('error', function(err) {
      err.time = +new Date();

      if (err.message === 'one') {
        oneErr = err;
      } else if (err.message === 'two') {
        twoErr = err;
      } else if (err.message === 'three') {
        should(oneErr.time - time).be.approximately(0, 20);
        should(twoErr.time - oneErr.time).be.approximately(200, 20);
        should(err.time - twoErr.time).be.approximately(400, 20);

        watch.end();

        done();
      }
    });
  });
});
