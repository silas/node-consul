'use strict';

/**
 * Module dependencies.
 */

var async = require('async');
var lodash = require('lodash');
var should = require('should');
var uuid = require('node-uuid');

var constants = require('../lib/constants');
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

  describe('members', function() {
    it('should return members agent sees in cluster gossip pool', function(done) {
      this.c1.agent.members(function(err, data) {
        should.not.exist(err);

        should(data).be.instanceOf(Array);

        data.length.should.eql(1);
        data.map(function(m) { return m.Name; }).should.containEql('node1');

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

    it('should work with opts', function(done) {
      this.c1.agent.self({}, function(err) {
        should.not.exist(err);

        done();
      });
    });
  });

  describe('maintenance', function() {
    it('should set node maintenance mode', function(done) {
      var self = this;

      var jobs = {};

      jobs.status = function(next) {
        self.c1.agent.checks(function(err, checks) {
          should.not.exist(err);

          should(checks).not.have.property('_node_maintenance');

          next();
        });
      };

      jobs.enable = ['status', function(next) {
        self.c1.agent.maintenance(true, function(err) {
          should.not.exist(err);

          next();
        });
      }];

      jobs.enableStatus = ['enable', function(next) {
        self.c1.agent.checks(function(err, checks) {
          should.not.exist(err);

          should(checks).have.property('_node_maintenance');
          checks._node_maintenance.should.have.property('Status', 'critical');

          next();
        });
      }];

      jobs.disable = ['enableStatus', function(next) {
        self.c1.agent.maintenance({ enable: false }, function(err) {
          should.not.exist(err);

          next();
        });
      }];

      jobs.disableStatus = ['disable', function(next) {
        self.c1.agent.checks(function(err, checks) {
          should.not.exist(err);

          should(checks).not.have.property('_node_maintenance');

          next();
        });
      }];

      async.auto(jobs, done);
    });

    it('should require valid enable', function(done) {
      this.c1.agent.maintenance({ enable: 'false' }, function(err) {
        should(err).have.property('message', 'consul: agent.maintenance: enable required');

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

    it('should require address', function(done) {
      this.c1.agent.join({}, function(err) {
        should(err).have.property('message', 'consul: agent.join: address required');

        done();
      });
    });
  });

  describe('forceLeave', function() {
    it('should remove node2 from the cluster', function(done) {
      var self = this;

      var jobs = {};

      jobs.ensureJoined = function(cb) {
        self.c1.agent.members(function(err, data) {
          should.not.exist(err);

          var node = lodash.find(data, function(m) { return m.Name === 'node2'; });

          should.exist(node);
          node.Status.should.eql(constants.AGENT_STATUS.indexOf('alive'));

          cb(null, data);
        });
      };

      jobs.forceLeave = ['ensureJoined', function(cb) {
        self.c1.agent.forceLeave('node2', cb);
      }];

      jobs.after = ['forceLeave', function(cb) {
        async.retry(
          100,
          function(cb) {
            self.c1.agent.members(function(err, data) {
              var node = lodash.find(data, function(m) { return m.Name === 'node2'; });
              var leaving = node && node.Status === constants.AGENT_STATUS.indexOf('leaving');

              if (err || !leaving) {
                if (!err) err = new Error('Not leaving');
                return setTimeout(function() { cb(err); }, 100);
              }

              cb();
            });
          },
          cb
        );
      }];

      async.auto(jobs, done);
    });

    it('should require node', function(done) {
      this.c1.agent.forceLeave({}, function(err) {
        should(err).have.property('message', 'consul: agent.forceLeave: node required');

        done();
      });
    });
  });

  describe('check', function() {
    before(function() {
      var self = this;

      // helper function to check existence of check
      self.exists = function(id, exists, cb) {
        self.c1.agent.checks(function(err, checks) {
          should.not.exist(err);

          var s = checks.should;

          if (!exists) s = s.not;

          s.have.property(id);

          cb();
        });
      };

      self.state = function(id, state, cb) {
        self.c1.agent.checks(function(err, checks) {
          should.not.exist(err);

          checks.should.have.property(id);

          var check = checks[id];

          check.Status.should.eql(state);

          cb();
        });
      };
    });

    beforeEach(function(done) {
      var self = this;

      self.name = 'check-' + uuid.v4();
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
        var opts = { name: self.name, ttl: '10s' };
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

    describe('list', function() {
      it('should return agent checks', function(done) {
        var self = this;

        self.c1.agent.checks(function(err, data) {
          should.not.exist(err);

          should.exist(data);
          data.should.have.property(self.name);

          done();
        });
      });
    });

    describe('register', function() {
      it('should create check', function(done) {
        var self = this;

        var name = 'check-' + uuid.v4();

        var jobs = [];

        jobs.push(function(cb) {
          self.exists(name, false, cb);
        });

        jobs.push(function(cb) {
          self.deregister.push(name);
          self.c1.agent.check.register({ name: name, ttl: '1s' }, cb);
        });

        jobs.push(function(cb) {
          self.exists(name, true, cb);
        });

        async.series(jobs, done);
      });
    });

    describe('deregister', function() {
      it('should remove check', function(done) {
        var self = this;

        var jobs = [];

        jobs.push(function(cb) {
          self.exists(self.name, true, cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.deregister(self.name, cb);
        });

        jobs.push(function(cb) {
          self.exists(self.name, false, cb);
        });

        async.series(jobs, done);
      });
    });

    describe('pass', function() {
      it('should mark check as passing', function(done) {
        var self = this;

        var jobs = [];

        jobs.push(function(cb) {
          self.state(self.name, 'critical', cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.pass(self.name, cb);
        });

        jobs.push(function(cb) {
          self.state(self.name, 'passing', cb);
        });

        async.series(jobs, done);
      });
    });

    describe('warn', function() {
      it('should mark check as warning', function(done) {
        var self = this;

        var jobs = [];

        jobs.push(function(cb) {
          self.state(self.name, 'critical', cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.warn(self.name, cb);
        });

        jobs.push(function(cb) {
          self.state(self.name, 'warning', cb);
        });

        async.series(jobs, done);
      });
    });

    describe('fail', function() {
      it('should mark check as critical', function(done) {
        var self = this;

        var jobs = [];

        jobs.push(function(cb) {
          self.state(self.name, 'critical', cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.fail(self.name, cb);
        });

        jobs.push(function(cb) {
          self.state(self.name, 'critical', cb);
        });

        async.series(jobs, done);
      });
    });
  });

  describe('service', function() {
    before(function() {
      var self = this;

      // helper function to check existence of service
      self.exists = function(id, exists, cb) {
        self.c1.agent.services(function(err, services) {
          should.not.exist(err);

          var s = services.should;

          if (!exists) s = s.not;

          s.have.property(id);

          cb();
        });
      };
    });

    beforeEach(function(done) {
      var self = this;

      self.name = 'service-' + uuid.v4();
      self.deregister = [self.name];

      var jobs = [];

      // remove existing services
      jobs.push(function(cb) {
        self.c1.agent.services(function(err, services) {
          if (err) return cb(err);

          services = lodash.filter(services, function(service) {
            return service && service.ID !== 'consul';
          });

          async.map(
            Object.keys(services),
            self.c1.agent.service.deregister.bind(self.c1.agent.service),
            cb
          );
        });
      });

      // add service
      jobs.push(function(cb) {
        self.c1.agent.service.register(self.name, cb);
      });

      async.series(jobs, done);
    });

    afterEach(function(done) {
      async.map(
        this.deregister,
        this.c1.agent.service.deregister.bind(this.c1.agent.service),
        done
      );
    });

    describe('list', function() {
      it('should return agent services', function(done) {
        var self = this;

        this.c1.agent.services(function(err, data) {
          should.not.exist(err);

          should.exist(data);

          data.should.have.property(self.name);

          done();
        });
      });
    });

    describe('register', function() {
      it('should create service', function(done) {
        var self = this;

        var name = 'service-' + uuid.v4();

        var jobs = [];

        jobs.push(function(cb) {
          self.exists(name, false, cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.service.register(name, cb);
        });

        jobs.push(function(cb) {
          self.exists(name, true, cb);
        });

        async.series(jobs, done);
      });

      it('should create service with http check', function(done) {
        var self = this;

        var name = 'service-' + uuid.v4();
        var notes = 'simple http check';

        var jobs = [];

        jobs.push(function(cb) {
          self.exists(name, false, cb);
        });

        jobs.push(function(cb) {
          var opts = {
            name: name,
            check: {
              http: 'http://127.0.0.1:8500',
              interval: '30s',
              notes: notes,
            },
          };

          self.c1.agent.service.register(opts, cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.list(function(err, checks) {
            if (err) return cb(err);

            should(checks).not.be.empty;
            should(checks['service:' + name]).have.property('Notes', notes);

            cb();
          });
        });

        async.series(jobs, done);
      });

      it('should create service with script check', function(done) {
        var self = this;

        var name = 'service-' + uuid.v4();
        var notes = 'simple script check';

        var jobs = [];

        jobs.push(function(cb) {
          self.exists(name, false, cb);
        });

        jobs.push(function(cb) {
          var opts = {
            name: name,
            check: {
              script: 'true',
              interval: '30s',
              notes: notes,
            },
          };

          self.c1.agent.service.register(opts, cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.check.list(function(err, checks) {
            if (err) return cb(err);

            should(checks).not.be.empty;
            should(checks['service:' + name]).have.property('Notes', notes);

            cb();
          });
        });

        async.series(jobs, done);
      });
    });

    describe('deregister', function() {
      it('should remove service', function(done) {
        var self = this;

        var jobs = [];

        jobs.push(function(cb) {
          self.exists(self.name, true, cb);
        });

        jobs.push(function(cb) {
          self.c1.agent.service.deregister(self.name, cb);
        });

        jobs.push(function(cb) {
          self.exists(self.name, false, cb);
        });

        async.series(jobs, done);
      });
    });

    describe('maintenance', function() {
      it('should set service maintenance mode', function(done) {
        var self = this;

        var checkId = '_service_maintenance:' + self.name;

        var jobs = {};

        jobs.status = function(next) {
          self.c1.agent.checks(function(err, checks) {
            should.not.exist(err);

            should(checks).not.have.property(checkId);

            next();
          });
        };

        jobs.enable = ['status', function(next) {
          var opts = {
            id: self.name,
            enable: true,
          };

          self.c1.agent.service.maintenance(opts, function(err) {
            should.not.exist(err);

            next();
          });
        }];

        jobs.enableStatus = ['enable', function(next) {
          self.c1.agent.checks(function(err, checks) {
            should.not.exist(err);

            should(checks).have.property(checkId);
            checks[checkId].should.have.property('Status', 'critical');

            next();
          });
        }];

        jobs.disable = ['enableStatus', function(next) {
          var opts = {
            id: self.name,
            enable: false,
          };

          self.c1.agent.service.maintenance(opts, function(err) {
            should.not.exist(err);

            next();
          });
        }];

        jobs.disableStatus = ['disable', function(next) {
          self.c1.agent.checks(function(err, checks) {
            should.not.exist(err);

            should(checks).not.have.property(checkId);

            next();
          });
        }];

        async.auto(jobs, done);
      });
    });
  });
});
