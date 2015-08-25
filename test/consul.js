'use strict';

/**
 * Module dependencies.
 */

var lodash = require('lodash');

var consul = require('../lib');

var helper = require('./helper');

/**
 * Tests
 */

describe('Consul', function() {
  helper.setup(this);

  it('should work', function() {
    helper.consul().should.not.have.property('_defaults');

    helper.consul({ defaults: { foo: 'bar' } }).should.not.have.property('_defaults');

    helper.consul({ defaults: { token: '123' } }).should.have.property('_defaults').eql({
      token: '123',
    });

    helper.consul({
      defaults: { token: '123', dc: 'test', foo: 'bar' },
    }).should.have.property('_defaults').eql({
      token: '123',
      dc: 'test',
    });

    helper.consul()._opts.baseUrl.should.eql({
      protocol: 'http:',
      auth: null,
      port: '8500',
      hostname: '127.0.0.1',
      path: '/v1',
    });

    helper.consul({
      host: '127.0.0.2',
      port: '8501',
      secure: true,
    })._opts.baseUrl.should.eql({
      protocol: 'https:',
      auth: null,
      port: '8501',
      hostname: '127.0.0.2',
      path: '/v1',
    });

    helper.consul({
      baseUrl: 'https://user:pass@example.org:8502/proxy/v1',
    })._opts.baseUrl.should.eql({
      protocol: 'https:',
      auth: 'user:pass',
      port: '8502',
      hostname: 'example.org',
      path: '/proxy/v1',
    });
  });

  describe('walk', function() {
    it('should work', function() {
      var setup = function(tree, depth, data) {
        data = data || [];

        var prefix = lodash.repeat(' ', depth);

        data.push(prefix + tree.name);

        lodash.each(tree.methods, function(method) {
          data.push(prefix + ' - ' + method.name + ' (' + method.type + ')');
        });

        lodash.each(tree.objects, function(tree) {
          setup(tree, depth + 1, data);
        });

        return data;
      };

      setup(consul.walk(), 0).should.eql([
        'Consul',
        ' - lock (eventemitter)',
        ' - watch (eventemitter)',
        ' - walk (sync)',
        ' Acl',
        '  - create (callback)',
        '  - update (callback)',
        '  - destroy (callback)',
        '  - info (callback)',
        '  - get (callback)',
        '  - clone (callback)',
        '  - list (callback)',
        ' Agent',
        '  - checks (callback)',
        '  - services (callback)',
        '  - members (callback)',
        '  - self (callback)',
        '  - maintenance (callback)',
        '  - join (callback)',
        '  - forceLeave (callback)',
        '  Check',
        '   - list (callback)',
        '   - register (callback)',
        '   - deregister (callback)',
        '   - pass (callback)',
        '   - warn (callback)',
        '   - fail (callback)',
        '  Service',
        '   - list (callback)',
        '   - register (callback)',
        '   - deregister (callback)',
        '   - maintenance (callback)',
        ' Catalog',
        '  - datacenters (callback)',
        '  - nodes (callback)',
        '  - services (callback)',
        '  Node',
        '   - list (callback)',
        '   - services (callback)',
        '  Service',
        '   - list (callback)',
        '   - nodes (callback)',
        ' Event',
        '  - fire (callback)',
        '  - list (callback)',
        ' Health',
        '  - node (callback)',
        '  - checks (callback)',
        '  - service (callback)',
        '  - state (callback)',
        ' Kv',
        '  - get (callback)',
        '  - keys (callback)',
        '  - set (callback)',
        '  - del (callback)',
        '  - delete (callback)',
        ' Lock',
        '  - acquire (sync)',
        '  - release (sync)',
        ' Session',
        '  - create (callback)',
        '  - destroy (callback)',
        '  - info (callback)',
        '  - get (callback)',
        '  - node (callback)',
        '  - list (callback)',
        '  - renew (callback)',
        ' Status',
        '  - leader (callback)',
        '  - peers (callback)',
        ' Watch',
        '  - isRunning (sync)',
        '  - updateTime (sync)',
        '  - end (sync)',
      ]);
    });
  });
});
