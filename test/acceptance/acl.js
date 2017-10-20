'use strict';

/**
 * Module dependencies.
 */

var lodash = require('lodash');
var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

helper.describe('Acl', function() {
  before(function(done) {
    helper.before(this, done);
  });

  after(function(done) {
    helper.after(this, done);
  });

  beforeEach(function(done) {
    var self = this;

    this.config = {
      name: 'test',
      rules: JSON.stringify({
        key: {
          '': {
            policy: 'read',
          },
          'rw/': {
            policy: 'write',
          },
          'deny/': {
            policy: 'deny',
          }
        },
      }),
    };

    self.c1.acl.create(lodash.merge({ token: 'root' }, this.config), function(err, acl) {
      if (err) return done(err);

      self.id = acl.ID;

      done();
    });
  });

  afterEach(function(done) {
    this.c1.acl.destroy({ id: this.id, token: 'root' }, done);
  });

  describe('create', function() {
    it('should create token', function(done) {
      this.c1.acl.create({ token: 'root', type: 'management' }, function(err, acl) {
        should.not.exist(err);

        acl.should.have.keys('ID');

        done();
      });
    });

    it('should require token', function(done) {
      var self = this;

      self.c1.acl.create({ token: 'test' }, function(err) {
        should(err).have.property('message', 'ACL not found');

        done();
      });
    });
  });

  describe('update', function() {
    it('should update existing token', function(done) {
      var self = this;

      var newName = 'My New Name';

      var opts = {
        id: self.id,
        name: newName,
        type: 'management',
        rules: self.config.rules,
        token: 'root',
      };

      self.c1.acl.update(opts, function(err) {
        should.not.exist(err);

        self.c1.acl.get({ id: self.id }, function(err, acl) {
          should.not.exist(err);

          acl.Name.should.equal(newName);

          done();
        });
      });
    });

    it('should require token', function(done) {
      var self = this;

      self.c1.acl.destroy({ id: self.id, token: '' }, function(err) {
        should(err).have.property('message', 'Permission denied');

        done();
      });
    });

    it('should require id', function(done) {
      var self = this;

      self.c1.acl.update({}, function(err) {
        should(err).have.property('message', 'consul: acl.update: id required');

        done();
      });
    });
  });

  describe('destroy', function() {
    it('should destroy token', function(done) {
      var self = this;

      self.c1.acl.destroy({ id: self.id, token: 'root' }, function(err) {
        should.not.exist(err);

        self.c1.acl.get({ id: self.id, token: 'root' }, function(err, acl) {
          should.not.exist(err);
          should.not.exist(acl);

          done();
        });
      });
    });

    it('should require token', function(done) {
      var self = this;

      self.c1.acl.destroy({ id: self.id, token: '' }, function(err) {
        should(err).have.property('message', 'Permission denied');

        done();
      });
    });

    it('should require id', function(done) {
      var self = this;

      self.c1.acl.destroy({}, function(err) {
        should(err).have.property('message', 'consul: acl.destroy: id required');

        done();
      });
    });
  });

  describe('get', function() {
    it('should return token information', function(done) {
      var self = this;

      self.c1.acl.get({ id: self.id, token: 'root' }, function(err, acl) {
        should.not.exist(err);

        acl.should.have.keys(
          'CreateIndex',
          'ModifyIndex',
          'ID',
          'Name',
          'Type',
          'Rules'
        );

        acl.Name.should.equal(self.config.name);
        acl.Type.should.equal('client');
        acl.Rules.should.equal(self.config.rules);

        done();
      });
    });

    it('should require token', function(done) {
      var self = this;

      self.c1.acl.get({ id: self.id, token: '' }, function(err) {
        should.not.exist(err);

        // TODO: should this be denied?
        //should(err).have.property('message', 'Permission denied');

        done();
      });
    });

    it('should require id', function(done) {
      var self = this;

      self.c1.acl.info({}, function(err) {
        should(err).have.property('message', 'consul: acl.info: id required');

        done();
      });
    });
  });

  describe('clone', function() {
    it('should copy existing token', function(done) {
      var self = this;

      self.c1.acl.clone({ id: 'root', token: 'root' }, function(err, acl) {
        should.not.exist(err);

        acl.should.have.keys('ID');

        self.c1.acl.get({ id: acl.ID, token: acl.ID }, function(err, acl) {
          should.not.exist(err);

          acl.should.have.keys(
            'CreateIndex',
            'ModifyIndex',
            'ID',
            'Name',
            'Type',
            'Rules'
          );

          acl.Name.should.equal('Master Token');
          acl.Type.should.equal('management');
          acl.Rules.should.equal('');

          done();
        });
      });
    });

    it('should require token', function(done) {
      var self = this;

      self.c1.acl.clone({ id: self.id, token: '' }, function(err) {
        should(err).have.property('message', 'Permission denied');

        done();
      });
    });

    it('should require id', function(done) {
      var self = this;

      self.c1.acl.clone({}, function(err) {
        should(err).have.property('message', 'consul: acl.clone: id required');

        done();
      });
    });
  });

  describe('list', function() {
    it('should return all tokens', function(done) {
      this.c1.acl.list({ token: 'root' }, function(err, acls) {
        should.not.exist(err);

        should(acls).be.an.instanceof(Array);
        acls.length.should.be.above(0);

        acls.forEach(function(acl) {
          acl.should.have.keys(
            'CreateIndex',
            'ModifyIndex',
            'ID',
            'Name',
            'Type',
            'Rules'
          );
        });

        done();
      });
    });

    it('should require token', function(done) {
      var self = this;

      self.c1.acl.list({ token: '' }, function(err) {
        should(err).have.property('message', 'Permission denied');

        done();
      });
    });
  });
});
