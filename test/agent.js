'use strict';

/* jshint expr: true */

/**
 * Module dependencies.
 */

var async = require('async');
var should = require('should');
var uuid = require('node-uuid');

var helper = require('./helper');

/**
 * Tests
 */

describe('Agent', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
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
      var self = this;

      var joinAddr = '127.0.0.1';
      var joinerAddr = '127.0.0.2';

      var jobs = [];

      jobs.push(function(cb) {
        self.c1.agent.members(function(err, data) {
          should.not.exist(err);

          data = data.map(function(m) { return m.Addr; });

          data.should.containEql(joinAddr);
          data.should.not.containEql(joinerAddr);

          cb();
        });
      });

      jobs.push(function(cb) {
        self.c2.agent.join(joinAddr, function(err) {
          should.not.exist(err);

          cb();
        });
      });

      async.series(jobs, done);
    });
  });

  describe('forceLeave', function() {
    it('should remove node2 from the cluster', function(done) {
      // TODO: check not leaving

      this.c1.agent.forceLeave('node2', function(err) {
        should.not.exist(err);

        // TODO: check leaving

        done();
      });
    });
  });

  describe('check', function() {
    before(function() {
      var self = this;

      // helper function to check existence of check
      self.check = function(id, exists, cb) {
        self.c1.agent.checks(function(err, checks) {
          should.not.exist(err);

          var s = checks.should;

          if (!exists) s = s.not;

          s.have.property(id);

          cb();
        });
      };
    });

    beforeEach(function(done) {
      var self = this;

      self.name = 'test-' + uuid.v4();
      self.deregister = [self.name];

      var jobs = [];

      // remove existing checks
      jobs.push(function(cb) {
        self.c1.agent.checks(function(err, checks) {
          if (err) return cb(err);

          async.map(
            Object.keys(checks),
            self.c1.agent.check.deregister.bind(self.c1.agent.check),
            cb
          );
        });
      });

      // add check
      jobs.push(function(cb) {
        var opts = { name: self.name, ttl: '1s' };
        self.c1.agent.check.register(opts, cb);
      });

      async.series(jobs, done);
    });

    afterEach(function(done) {
      async.map(
        this.deregister,
        this.c1.agent.check.deregister.bind(this.c1.agent.check),
        done
      );
    });

    describe('register', function() {
      it('should work', function(done) {
        var self = this;

        var name = 'test-' + uuid.v4();

        var jobs = [];

        jobs.push(function(cb) {
          self.check(name, false, cb);
        });

        jobs.push(function(cb) {
          self.deregister.push(name);
          self.c1.agent.check.register({ name: name, ttl: '1s' }, cb);
        });

        jobs.push(function(cb) {
          self.check(name, true, cb);
        });

        async.series(jobs, done);
      });
    });

    describe('deregister', function() {
      it('should work', function(done) {
        var self = this;

        var jobs = [];

        jobs.push(function(cb) {
          self.check(self.name, true, cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.deregister(self.name, cb);
        });

        jobs.push(function(cb) {
          self.check(self.name, false, cb);
        });

        async.series(jobs, done);
      });
    });
  });
});
