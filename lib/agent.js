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
  if (!callback) {
    callback = opts;
    opts = {};
  }

  this.consul._log(['debug', 'agent', 'members'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'agent.members',
    path: '/agent/members',
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Returns the local node configuration
 */

Agent.prototype.self = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  this.consul._log(['debug', 'agent', 'self']);

  var req = {
    name: 'agent.self',
    path: '/agent/self',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
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

  var req = {
    name: 'agent.join',
    path: '/agent/join/{address}',
    params: { address: opts.address },
    query: {},
  };

  if (!opts.address) {
    return callback(this.consul._err('address required', req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
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

  var req = {
    name: 'agent.forceLeave',
    path: '/agent/force-leave/{node}',
    params: { node: opts.node },
  };

  if (!opts.node) {
    return callback(this.consul._err('node required', req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
};

/**
 * Module exports.
 */

exports.Agent = Agent;
