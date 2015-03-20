'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Event', function() {
  helper.setup(this);

  describe('fire', function() {
    it('should work', function(done) {
      this.nock
        .put('/v1/event/fire/name?node=node1&service=service1&tag=tag1', 'test')
        .reply(200, { ok: true, Payload: 'dGVzdA==' });

      var opts = {
        name: 'name',
        payload: 'test',
        node: 'node1',
        service: 'service1',
        tag: 'tag1',
      };

      this.consul.event.fire(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true, Payload: 'test' });

        done();
      });
    });

    it('should work with two arguments', function(done) {
      this.nock
        .put('/v1/event/fire/name', 'test')
        .reply(200, { ok: true });

      this.consul.event.fire('name', new Buffer('test'), function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should work with one argument', function(done) {
      this.nock
        .put('/v1/event/fire/name')
        .reply(500);

      this.consul.event.fire('name', function(err) {
        should(err).have.property('message', 'internal server error');

        done();
      });
    });

    it('should require name', function(done) {
      this.consul.event.fire({}, function(err) {
        should(err).have.property('message', 'consul: event.fire: name required');

        done();
      });
    });
  });

  describe('list', function() {
    it('should work', function(done) {
      this.nock
        .get('/v1/event/list?name=name1')
        .reply(200, [
          { ok: true, Payload: 'dGVzdA==' },
          { ok: true },
        ]);

      var opts = { name: 'name1' };

      this.consul.event.list(opts, function(err, data) {
        should.not.exist(err);

        should(data).eql([{ ok: true, Payload: 'test' }, { ok: true }]);

        done();
      });
    });

    it('should work with one argument', function(done) {
      this.nock
        .get('/v1/event/list?name=name1')
        .reply(200, []);

      this.consul.event.list('name1', function(err) {
        should.not.exist(err);

        done();
      });
    });

    it('should work with no arguments', function(done) {
      this.nock
        .get('/v1/event/list')
        .reply(500);

      this.consul.event.list(function(err) {
        should(err).have.property('message', 'internal server error');

        done();
      });
    });
  });
});
