'use strict';

/**
 * Module dependencies.
 */

var async = require('async');
var debug = require('debug')('acceptance:lock');
var lodash = require('lodash');
var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

helper.describe('Lock', function() {
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
    var self = this;

    var locks = {};

    async.times(50, function(n, next) {
      var c = self.c1;
      var prefix = 'lock ' + n + ': ';
      var lock = c.lock({
        key: 'test',
        lockRetryTime: '10ms',
      });

      lock.on('acquire', function() {
        debug(prefix + ': acquire');

        locks[n] = true;

        lodash.each(locks, function(i, enabled) {
          if (enabled && i !== n) {
            should(locks).not.have.property(i, enabled);
          }
          lock.release();
        });
      });

      lock.on('release', function() {
        debug(prefix + ': release');

        locks[n] = false;
      });

      lock.on('error', function(err) {
        debug(prefix + ': error: ', err);
      });

      lock.on('end', function() {
        debug(prefix + ': end');

        delete locks[n];

        next();
      });

      lock.acquire();
    }, done);
  });
});
