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

helper.describe('Kv', function() {
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

  describe('get', function() {
    it('should return one kv pair', function(done) {
      var key = this.key;
      var value = this.value;

      this.c1.kv.get(key, function(err, data) {
        should.not.exist(err);

        data.should.have.keys(
          'CreateIndex',
          'ModifyIndex',
          'LockIndex',
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

    it('should return raw value', function(done) {
      var key = this.key;
      var value = this.value;

      this.c1.kv.get({ key: key, raw: true }, function(err, data) {
        should.not.exist(err);

        new Buffer(value).should.eql(data);

        done();
      });
    });

    it('should return no kv pair', function(done) {
      this.c1.kv.get('none', function(err, data) {
        should.not.exist(err);
        should.not.exist(data);

        done();
      });
    });

    it('should return list of kv pairs', function(done) {
      var key = this.key;
      var value = this.value;

      this.c1.kv.get({ recurse: true }, function(err, data) {
        should.not.exist(err);

        data.should.be.instanceof(Array);
        data.length.should.eql(1);

        var item = data[0];
        item.should.have.keys(
          'CreateIndex',
          'ModifyIndex',
          'LockIndex',
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
      var c = this.c1;
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
        var opts = {
          key: key,
          index: result.get.ModifyIndex,
          wait: '3s'
        };

        c.kv.get(opts, function(err, data) {
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

  describe('keys', function() {
    beforeEach(function(done) {
      var self = this;

      self.keys = [
        'a/x/1',
        'a/y/2',
        'a/z/3',
      ];

      async.each(self.keys, function(key, next) {
        self.c1.kv.set(key, 'value', function(err) {
          next(err);
        });
      }, done);
    });

    it('should return keys', function(done) {
      var self = this;

      this.c1.kv.keys('a', function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);

        data.length.should.equal(3);

        data.should.eql(self.keys.filter(function(key) {
          return key.match(/^a/);
        }));

        done();
      });
    });

    it('should return keys with separator', function(done) {
      var self = this;

      var opts = {
        key: 'a/',
        separator: '/',
      };

      this.c1.kv.keys(opts, function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);

        data.length.should.equal(3);

        data.should.eql(
          self.keys
            .filter(function(key) { return key.match(/^a\//); })
            .map(function(v) { return v.slice(0, 4); })
        );

        done();
      });
    });

    it('should return all keys', function(done) {
      this.c1.kv.keys(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);

        data.length.should.equal(4);

        done();
      });
    });
  });

  describe('set', function() {
    it('should create kv pair', function(done) {
      var c = this.c1;
      var key = 'one';
      var value = 'two';

      c.kv.set(key, value, function(err, ok) {
        should.not.exist(err);

        ok.should.be.true;

        c.kv.get(key, function(err, data) {
          should.not.exist(err);

          data.should.have.keys(
            'CreateIndex',
            'ModifyIndex',
            'LockIndex',
            'Key',
            'Flags',
            'Value'
          );
          data.Value.should.eql(value);

          done();
        });
      });
    });

    it('should create kv pair with null value', function(done) {
      var c = this.c1;
      var key = 'one';
      var value = null;

      c.kv.set(key, value, function(err, ok) {
        should.not.exist(err);

        ok.should.be.true;

        c.kv.get(key, function(err, data) {
          should.not.exist(err);

          data.should.have.keys(
            'CreateIndex',
            'ModifyIndex',
            'LockIndex',
            'Key',
            'Flags',
            'Value'
          );
          should(data.Value).be.null;

          done();
        });
      });
    });
  });

  describe('del', function() {
    it('should delete kv pair', function(done) {
      var c = this.c1;
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
