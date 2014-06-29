'use strict';

/* jshint expr: true */

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Session', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  beforeEach(function(done) {
    var self = this;

    self.c1.session.create(function(err, session) {
      if (err) return done(err);

      self.id = session.ID;

      done();
    });
  });

  afterEach(function(done) {
    this.c1.session.destroy(this.id, done);
  });

  describe('create', function() {
    it('should create session', function(done) {
      this.c1.session.create(function(err, session) {
        should.not.exist(err);

        session.should.have.keys('ID');

        done();
      });
    });
  });

  describe('destroy', function() {
    it('should destroy session', function(done) {
      var self = this;

      self.c1.session.destroy(self.id, function(err) {
        should.not.exist(err);

        self.c1.session.get(self.id, function(err, session) {
          should.not.exist(err);
          should.not.exist(session);

          done();
        });
      });
    });
  });

  describe('get', function() {
    it('should return session information', function(done) {
      this.c1.session.get(this.id, function(err, session) {
        should.not.exist(err);

        session.should.have.keys(
          'CreateIndex',
          'ID',
          'Name',
          'Node',
          'Checks',
          'LockDelay'
        );

        done();
      });
    });
  });

  describe('node', function() {
    it('should return sessions for node', function(done) {
      this.c1.session.node('node1', function(err, sessions) {
        should.not.exist(err);

        should(sessions).be.an.instanceof(Array);
        sessions.length.should.be.above(0);

        sessions.forEach(function(session) {
          session.should.have.keys(
            'CreateIndex',
            'ID',
            'Name',
            'Node',
            'Checks',
            'LockDelay'
          );
        });

        done();
      });
    });

    it('should return an empty list when no node found', function(done) {
      this.c1.session.node('node', function(err, sessions) {
        should.not.exist(err);

        should(sessions).be.an.instanceof(Array);
        sessions.length.should.be.eql(0);

        done();
      });
    });
  });

  describe('list', function() {
    it('should return all sessions', function(done) {
      this.c1.session.list(function(err, sessions) {
        should.not.exist(err);

        should(sessions).be.an.instanceof(Array);
        sessions.length.should.be.above(0);

        sessions.forEach(function(session) {
          session.should.have.keys(
            'CreateIndex',
            'ID',
            'Name',
            'Node',
            'Checks',
            'LockDelay'
          );
        });

        done();
      });
    });
  });
});
