'use strict';

/**
 * Module dependencies.
 */

var should = require('should');

var helper = require('./helper');

/**
 * Tests
 */

describe('Transaction', function() {
  helper.setup(this);

  describe('create', function() {
    it('should work', function(done) {
      var operations = [
        {
          KV: {
            Verb: 'create',
            Key: 'key',
            Value: Buffer.from('value').toString('base64'),
          }
        },
        {
          Node: {
            Verb: 'set',
            Node: {
              ID: '67539c9d-b948-ba67-edd4-d07a676d6673',
              Node: 'bar',
              Address: '192.168.0.1',
              Datacenter: 'dc1',
              Meta: {
                instance_type: 'm2.large'
              }
            }
          }
        },
        {
          Service: {
            Verb: 'delete',
            Node: 'foo',
            Service: {
              ID: 'db1'
            }
          }
        },
        {
          Check: {
            Verb: 'cas',
            Check: {
                Node: 'bar',
              CheckID: 'service:web1',
              Name: 'Web HTTP Check',
              Status: 'critical',
              ServiceID: 'web1',
              ServiceName: 'web',
              ServiceTags: null,
              Definition: {
                HTTP: 'http://localhost:8080',
                Interval: '10s'
              },
              ModifyIndex: 22
            }
          }
        }
      ];

      this.nock
        .put('/v1/txn', operations)
        .reply(200, { ok: true });

      this.consul.transaction.create(operations, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should accept an option as arguments', function(done) {
      var operations = [
        {
          KV: {
            Verb: 'create',
            Key: 'key',
            Value: Buffer.from('value').toString('base64'),
          }
        },
        {
          Node: {
            Verb: 'set',
            Node: {
              ID: '67539c9d-b948-ba67-edd4-d07a676d6673',
              Node: 'bar',
              Address: '192.168.0.1',
              Datacenter: 'dc1',
              Meta: {
                instance_type: 'm2.large'
              }
            }
          }
        },
        {
          Service: {
            Verb: 'delete',
            Node: 'foo',
            Service: {
              ID: 'db1'
            }
          }
        },
        {
          Check: {
            Verb: 'cas',
            Check: {
                Node: 'bar',
              CheckID: 'service:web1',
              Name: 'Web HTTP Check',
              Status: 'critical',
              ServiceID: 'web1',
              ServiceName: 'web',
              ServiceTags: null,
              Definition: {
                HTTP: 'http://localhost:8080',
                Interval: '10s'
              },
              ModifyIndex: 22
            }
          }
        }
      ];

      this.nock
        .put('/v1/txn?stale=1', operations)
        .reply(200, { ok: true });

      this.consul.transaction.create(operations, { stale: true }, function(err, data) {
        should.not.exist(err);

        should(data).eql({ ok: true });

        done();
      });
    });

    it('should require a list of operations', function(done) {
      this.consul.transaction.create(function(err) {
        should(err).have.property('message',
          'consul: Transaction.create: a list of operations are required as first arguments');

        done();
      });
    });

    it('should require a list of operations', function(done) {
      this.consul.transaction.create([], function(err) {
        should(err).have.property('message',
          'consul: Transaction.create: at least two operations are required');

        done();
      });
    });
  });
});
