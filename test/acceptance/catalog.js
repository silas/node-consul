'use strict';

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

helper.describe('Catalog', function() {
  before(function(done) {
    var self = this;

    var jobs = [];

    jobs.push(function(cb) {
      helper.before(self, cb);
    });

    jobs.push(function(cb) {
      self.service = {
        name: 'service-' + uuid.v4(),
        tag: 'tag-' + uuid.v4(),
      };

      var jobs = [];

      jobs.push(function(cb) {
        self.c1.agent.service.register({
          name: self.service.name,
          tags: [self.service.tag],
        }, cb);
      });

      jobs.push(function(cb) {
        async.retry(
          100,
          function(cb) {
            self.c1.catalog.services(function(err, data) {
              if (!data || !data.hasOwnProperty(self.service.name)) {
                err = new Error('Service not created: ' + self.service.name);
              }

              if (err) return setTimeout(function() { cb(err); }, 100);

              cb(null, data);
            });
          },
          cb
        );
      });

      async.series(jobs, cb);
    });

    async.series(jobs, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  describe('datacenters', function() {
    it('should return all known datacenters', function(done) {
      this.c1.catalog.datacenters(function(err, data) {
        should.not.exist(err);

        should(data).eql(['dc1']);

        done();
      });
    });
  });

  describe('node', function() {
    describe('list', function() {
      it('should return all nodes in the current dc', function(done) {
        this.c1.catalog.node.list(function(err, data) {
          should.not.exist(err);

          should(data).match([
            { Node: 'node1', Address: '127.0.0.1' },
          ]);

          done();
        });
      });

      it('should return all nodes in specified dc', function(done) {
        this.c1.catalog.nodes('dc1', function(err, data) {
          should.not.exist(err);

          should(data).match([
            { Node: 'node1', Address: '127.0.0.1' },
          ]);

          done();
        });
      });
    });

    describe('services', function() {
      it('should return all services for a given node', function(done) {
        var self = this;

        self.c1.catalog.node.services('node1', function(err, data) {
          should.not.exist(err);

          should.exist(data);
          should.exist(data.Services);
          should.exist(data.Services[self.service.name]);
          data.Services[self.service.name].should.have.properties(
            'ID',
            'Service',
            'Tags',
            'Port'
          );
          data.Services[self.service.name].Service.should.eql(self.service.name);
          data.Services[self.service.name].Tags.should.eql([self.service.tag]);

          done();
        });
      });
    });
  });

  describe('service', function() {
    describe('list', function() {
      it('should return all services in the current dc', function(done) {
        var self = this;

        self.c1.catalog.service.list(function(err, data) {
          should.not.exist(err);

          var services = { consul: [] };
          services[self.service.name] = [self.service.tag];

          should(data).eql(services);

          done();
        });
      });
    });

    describe('nodes', function() {
      it('should return all nodes for a given service', function(done) {
        var self = this;

        self.c1.catalog.service.nodes(self.service.name, function(err, data) {
          should.not.exist(err);

          should(data).be.instanceof(Array);

          data = data.map(function(n) { return n.Node; });

          should(data).eql(['node1']);

          done();
        });
      });
    });
  });
});
