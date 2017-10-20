'use strict';

/**
 * Module dependencies.
 */

var async = require('async');
var lodash = require('lodash');
var should = require('should');
var uuid = require('node-uuid');

var helper = require('./helper');

/**
 * Tests
 */

helper.describe('Health', function() {
  before(function(done) {
    var self = this;

    self.service = 'service-' + uuid.v4();

    var jobs = [];

    jobs.push(function(cb) {
      helper.before(self, cb);
    });

    jobs.push(function(cb) {
      self.c1.agent.service.register({
        name: self.service,
        check: { ttl: '60s' },
      }, cb);
    });

    jobs.push(function(cb) {
      async.retry(
        100,
        function(cb) {
          self.c1.health.node('node1', function(err, data) {
            if (data && Array.isArray(data)) {
              data = lodash.find(data, function(c) { return c.ServiceName === self.service; });
            }

            if (err || !data) err = new Error('Check not for service: ' + self.service);

            if (err) return setTimeout(function() { cb(err); }, 100);

            cb();
          });
        },
        cb
      );
    });

    async.series(jobs, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  describe('node', function() {
    it('should return checks for given node', function(done) {
      this.c1.health.node('node1', function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);

        should.exist(data[0]);

        data[0].should.have.properties('Node', 'CheckID', 'Status');

        data[0].Node.should.eql('node1');
        data[0].CheckID.should.eql('serfHealth');
        data[0].Status.should.eql('passing');

        done();
      });
    });
  });

  describe('checks', function() {
    it('should return all checks for a given service', function(done) {
      var self = this;

      self.c1.health.checks(self.service, function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);
        data = lodash.find(data, function(c) { return c.ServiceName === self.service; });

        should.exist(data);

        data.should.have.properties('Node', 'CheckID');

        data.CheckID.should.eql('service:' + self.service);

        done();
      });
    });
  });

  describe('service', function() {
    it('should return health information for given service', function(done) {
      var self = this;

      self.c1.health.service(self.service, function(err, data) {
        should.not.exist(err);

        should.exist(data);

        should(data).be.instanceof(Array);
        should.exist(data[0]);

        data[0].should.have.properties('Node', 'Service', 'Checks');

        data[0].Node.should.match({
          Node: 'node1',
          Address: '127.0.0.1',
        });

        data[0].Service.should.have.properties('ID', 'Service', 'Tags');

        data[0].Service.ID.should.equal(self.service);
        data[0].Service.Service.should.equal(self.service);

        var checks = data[0].Checks.map(function(c) { return c.CheckID; }).sort();

        checks.should.eql([
          'serfHealth',
          'service:' + self.service,
        ]);

        done();
      });
    });
  });

  describe('state', function() {
    it('should return checks with a given state', function(done) {
      var self = this;

      self.c1.health.state('critical', function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);
        should.exist(data[0]);

        data[0].should.have.property('ServiceName');
        data[0].ServiceName.should.eql(self.service);

        data.length.should.eql(1);

        done();
      });
    });

    it('should return all checks', function(done) {
      var self = this;

      self.c1.health.state('any', function(err, data) {
        should.not.exist(err);

        should(data).be.instanceof(Array);

        data.length.should.eql(2);

        done();
      });
    });
  });
});
