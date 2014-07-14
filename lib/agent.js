/**
 * Agent control
 */

'use strict';

/**
 * Module dependencies.
 */

var AgentCheck = require('./agent/check').AgentCheck;
var AgentService = require('./agent/service').AgentService;
var utils = require('./utils');

/**
 * Initialize a new `Agent` client.
 */

function Agent(consul) {
  this.consul = consul;
  this.check = new AgentCheck(consul);
  this.service = new AgentService(consul);
}

/**
 * Returns the checks the local agent is managing
 */

Agent.prototype.checks = function(callback) {
  this.check.list(callback);
};

/**
 * Returns the services local agent is managing
 */

Agent.prototype.services = function(callback) {
  this.service.list(callback);
};

/**
 * Returns the members as seen by the local consul agent
 */

Agent.prototype.members = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  this.consul._log(['debug', 'agent', 'members'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    query: {},
  };

  if (opts.wan) req.query.wan = '1';

  this.consul._get('/agent/members', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the local node configuration
 */

Agent.prototype.self = function(callback) {
  this.consul._log(['debug', 'agent', 'self']);

  this.consul._get('/agent/self', function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Trigger local agent to join a node
 */

Agent.prototype.join = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { address: opts };
  }

  this.consul._log(['debug', 'agent', 'join'], opts);

  opts = utils.normalizeKeys(opts);

  if (!opts.address) return callback(new Error('address required'));

  var req = {
    path: { address: opts.address },
    query: {},
  };

  if (opts.wan) req.query.wan = '1';

  this.consul._get('/agent/join/{address}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Force remove node
 */

Agent.prototype.forceLeave = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { node: opts };
  }

  this.consul._log(['debug', 'agent', 'forceLeave'], opts);

  opts = utils.normalizeKeys(opts);

  if (!opts.node) return callback(new Error('node required'));

  var req = {
    method: 'GET',
    path: { node: opts.node },
  };

  this.consul._get('/agent/force-leave/{node}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module exports.
 */

exports.Agent = Agent;
