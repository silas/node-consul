'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Acl', function() {
  helper.setup(this);

  describe('create', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/acl/create', {
          Name: 'name',
          Type: 'type',
          Rules: 'rules',
        })
        .reply(200, { ok: true });

      var opts = {
        name: 'name',
        type: 'type',
        rules: 'rules',
      };

      this.consul.acl.create(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .put('/v1/acl/create', {})
        .reply(200, { ok: true });

      this.consul.acl.create(function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });
  });

  describe('update', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/acl/update', {
          ID: '123',
          Name: 'name',
          Type: 'type',
          Rules: 'rules',
        })
        .reply(200);

      var opts = {
        id: '123',
        name: 'name',
        type: 'type',
        rules: 'rules',
      };

      this.consul.acl.update(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with just ID', function(done) {
      this.nock
        .put('/v1/acl/update', { ID: '123' })
        .reply(200);

      var opts = { id: '123' };

      this.consul.acl.update(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.acl.update({}, function(err) {
        should(err).have.property('message', 'consul: acl.update: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('destroy', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/acl/destroy/123')
        .reply(200);

      var opts = { id: '123' };

      this.consul.acl.destroy(opts, function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .put('/v1/acl/destroy/123')
        .reply(200);

      this.consul.acl.destroy('123', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.acl.destroy({}, function(err) {
        should(err).have.property('message', 'consul: acl.destroy: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('info', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/acl/info/123')
        .reply(200, [{ ok: true }]);

      var opts = { id: '123' };

      this.consul.acl.info(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work using get alias', function(done) {
      this.nock
        .get('/v1/acl/info/123')
        .reply(200, [{ ok: true }]);

      var opts = { id: '123' };

      this.consul.acl.get(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .get('/v1/acl/info/123')
        .reply(200, [{ ok: true }]);

      this.consul.acl.info('123', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.acl.info({}, function(err) {
        should(err).have.property('message', 'consul: acl.info: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('clone', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/acl/clone/123')
        .reply(200, { ID: '124' });

      var opts = { id: '123' };

      this.consul.acl.clone(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ID: '124' });

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .put('/v1/acl/clone/123')
        .reply(200, { ID: '124' });

      this.consul.acl.clone('123', function(err, data) {
        should.not.exist(err);

        should(data).eql({ ID: '124' });

        done();
      });
    });

    it('should require ID', function(done) {
      this.consul.acl.clone({}, function(err) {
        should(err).have.property('message', 'consul: acl.clone: id required');
        should(err).have.property('isValidation', true);

        done();
      });
    });
  });

  describe('list', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/acl/list')
        .reply(200, [{ ok: true }]);

      this.consul.acl.list({}, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });

    it('should work with string ID', function(done) {
      this.nock
        .get('/v1/acl/list')
        .reply(200, [{ ok: true }]);

      this.consul.acl.list(function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true }]);

        done();
      });
    });
  });
});
