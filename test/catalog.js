'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Catalog', function() {
  helper.setup(this);

  describe('datacenters', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/catalog/datacenters')
        .reply(200, [{ ok: true }]);

      var opts = {};

      this.consul.catalog.datacenters(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/catalog/datacenters')
        .reply(200, [{ ok: true }]);

      this.consul.catalog.datacenters(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('nodes', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/catalog/nodes')
        .reply(200, [{ ok: true }]);

      var opts = {};

      this.consul.catalog.nodes(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with just string', function(done) {
      this.nock
        .get('/v1/catalog/nodes?dc=dc1')
        .reply(200, [{ ok: true }]);

      this.consul.catalog.nodes('dc1', function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/catalog/nodes')
        .reply(200, [{ ok: true }]);

      this.consul.catalog.nodes(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('node', function() {
    describe('list', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/catalog/nodes')
          .reply(200, [{ ok: true }]);

        var opts = {};

        this.consul.catalog.node.list(opts, function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with just string', function(done) {
        this.nock
          .get('/v1/catalog/nodes?dc=dc1')
          .reply(200, [{ ok: true }]);

        this.consul.catalog.node.list('dc1', function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with no arguments', function(done) {
        this.nock
          .get('/v1/catalog/nodes')
          .reply(200, [{ ok: true }]);

        this.consul.catalog.node.list(function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });
    });

    describe('services', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/catalog/node/node1')
          .reply(200, [{ ok: true }]);

        var opts = { node: 'node1' };

        this.consul.catalog.node.services(opts, function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with just string', function(done) {
        this.nock
          .get('/v1/catalog/node/node1')
          .reply(200, [{ ok: true }]);

        this.consul.catalog.node.services('node1', function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should require node', function(done) {
        this.consul.catalog.node.services({}, function(err) {
          should(err).property('message', 'consul: catalog.node.services: node required');

          done();
        });
      });
    });
  });

  describe('services', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/catalog/services')
        .reply(200, [{ ok: true }]);

      var opts = {};

      this.consul.catalog.services(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with just string', function(done) {
      this.nock
        .get('/v1/catalog/services?dc=dc1')
        .reply(200, [{ ok: true }]);

      this.consul.catalog.services('dc1', function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/catalog/services')
        .reply(200, [{ ok: true }]);

      this.consul.catalog.services(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });

  describe('services', function() {
    describe('list', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/catalog/services')
          .reply(200, [{ ok: true }]);

        var opts = {};

        this.consul.catalog.service.list(opts, function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with just string', function(done) {
        this.nock
          .get('/v1/catalog/services?dc=dc1')
          .reply(200, [{ ok: true }]);

        this.consul.catalog.service.list('dc1', function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with no arguments', function(done) {
        this.nock
          .get('/v1/catalog/services')
          .reply(200, [{ ok: true }]);

        this.consul.catalog.service.list(function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });
    });

    describe('nodes', function() {
      it('should work', function(done) {
        this.nock
          .get('/v1/catalog/service/service1?tag=web')
          .reply(200, [{ ok: true }]);

        var opts = {
          service: 'service1',
          tag: 'web',
        };

        this.consul.catalog.service.nodes(opts, function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should work with just string', function(done) {
        this.nock
          .get('/v1/catalog/service/service1')
          .reply(200, [{ ok: true }]);

        this.consul.catalog.service.nodes('service1', function(err, data) {
          should.not.exist(err);

          should(data).eql([{ ok: true }]);

          done();
        });
      });

      it('should require service', function(done) {
        this.consul.catalog.service.nodes({}, function(err) {
          should(err).property('message', 'consul: catalog.service.nodes: service required');

          done();
        });
      });
    });
  });
});
