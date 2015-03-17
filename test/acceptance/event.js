'use strict';

/**
 * Module dependencies.
 */

var should = require('should');
var uuid = require('node-uuid');

var helper = require('./helper');

/**
 * Tests
 */

helper.describe('Event', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  beforeEach(function(done) {
    var self = this;

    self.name = 'event-' + uuid.v4();
    self.payload = JSON.stringify({ hello: 'world' });
    self.bufferPayload = new Buffer(self.payload);

    self.c1.event.fire(self.name, self.payload, function(err, event) {
      if (err) return done(err);

      self.event = event;

      done();
    });
  });

  describe('fire', function() {
    it('should fire an event', function(done) {
      this.c1.event.fire('test', function(err, event) {
        should.not.exist(err);

        event.should.have.keys(
          'ID',
          'Name',
          'Payload',
          'NodeFilter',
          'ServiceFilter',
          'TagFilter',
          'Version',
          'LTime'
        );

        event.Name.should.equal('test');

        done();
      });
    });
  });

  describe('list', function() {
    it('should return events', function(done) {
      var self = this;

      self.c1.event.list(function(err, events) {
        should.not.exist(err);

        events.should.not.be.empty;

        done();
      });
    });

    it('should return event with given name', function(done) {
      var self = this;

      self.c1.event.list(self.name, function(err, events) {
        should.not.exist(err);

        events.should.not.be.empty;
        events.length.should.equal(1);

        events[0].ID.should.equal(self.event.ID);
        events[0].Name.should.equal(self.name);
        events[0].Payload.should.equal(self.payload);

        done();
      });
    });

    it('should return payload as buffer', function(done) {
      var self = this;

      self.c1.event.list({ name: self.name, buffer: true }, function(err, events) {
        should.not.exist(err);

        events.should.not.be.empty;

        events[0].Payload.should.eql(self.bufferPayload);

        done();
      });
    });
  });
});
