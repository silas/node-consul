'use strict';

/* jshint expr: true */

/**
 * Module dependencies.
 */

var async = require('async');
var should = require('should');
var uuid = require('node-uuid');

var consul = require('../lib');

/**
 * Tests
 */

describe('Agent', function() {
  before(function() {
    for (var i = 0; i < 3; i++) {
      this['c' + i] = consul({ host: '127.0.0.' + i });
    }
  });

  describe('checks', function() {
    it('should return local checks', function(done) {
      this.c1.agent.checks(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceOf(Object);

        done();
      });
    });
  });

  describe('services', function() {
    it('should return local services', function(done) {
      this.c1.agent.services(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceOf(Object);

        done();
      });
    });
  });

  describe('members', function() {
    it('should return members agent sees in cluster gossip pool', function(done) {
      this.c1.agent.members(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceOf(Object);

        done();
      });
    });
  });

  describe('self', function() {
    it('should return information about agent', function(done) {
      this.c1.agent.self(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceOf(Object);
        data.should.have.keys('Config', 'Member');

        data.Config.Bootstrap.should.be.true;
        data.Config.Server.should.be.true;
        data.Config.Datacenter.should.eql('dc1');
        data.Config.NodeName.should.eql('node1');

        data.Member.Name.should.eql('node1');
        data.Member.Addr.should.eql('127.0.0.1');

        done();
      });
    });
  });

  describe('self', function() {
    it('should return information about agent', function(done) {
      this.c1.agent.self(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceOf(Object);
        data.should.have.keys('Config', 'Member');

        data.Config.Bootstrap.should.be.true;
        data.Config.Server.should.be.true;
        data.Config.Datacenter.should.eql('dc1');
        data.Config.NodeName.should.eql('node1');

        data.Member.Name.should.eql('node1');
        data.Member.Addr.should.eql('127.0.0.1');

        done();
      });
    });
  });

  describe('join', function() {
    it('should make node2 join cluster', function(done) {
      // TODO: check member list before and after
      this.c2.agent.join('127.0.0.1', function(err) {
        should.not.exist(err);

        done();
      });
    });
  });

  describe('forceLeave', function() {
    it('should remove node2 from the cluster', function(done) {
      // TODO: check for leaving state
      this.c1.agent.forceLeave('node2', function(err) {
        should.not.exist(err);

        done();
      });
    });
  });

  describe('check', function() {
    describe('register', function() {
      it('should register a check', function(done) {
        var c = this.c1;

        var name = 'check-' + uuid.v4();

        var jobs = {};

        jobs.register = function(cb) {
          var opts = { name: name, ttl: '10ms' };

          c.agent.check.register(opts, cb);
        };

        jobs.exists = ['register', function(cb) {
          // TODO: ensure check exists
          cb();
        }];

        jobs.deregister = ['exists', function(cb) {
          c.agent.check.deregister(name, cb);
        }];

        async.auto(jobs, function(err) {
          should.not.exist(err);

          done();
        });
      });
    });

    describe('deregister', function() {
      it('should deregister a check', function(done) {
        var c = this.c1;

        var name = 'check-' + uuid.v4();

        var jobs = {};

        jobs.register = function(cb) {
          var opts = { name: name, ttl: '10ms' };

          c.agent.check.register(opts, cb);
        };

        jobs.exists = ['register', function(cb) {
          // TODO: ensure check exists
          cb();
        }];

        jobs.deregister = ['exists', function(cb) {
          c.agent.check.deregister(name, cb);
        }];

        async.auto(jobs, function(err) {
          should.not.exist(err);

          // TODO: ensure check doesn't exist

          done();
        });
      });
    });
  });
});
