/**
 * Agent control
 */

'use strict';

/**
 * Module dependencies.
 */

var AgentCheck = require('./agent/check').AgentCheck;
var AgentService = require('./agent/service').AgentService;
var errors = require('./errors');
var utils = require('./utils');

/**
 * Initialize a new `Agent` client.
 */

function Agent(consul) {
  this.consul = consul;
  this.check = new Agent.Check(consul);
  this.service = new Agent.Service(consul);
}

Agent.Check = AgentCheck;
Agent.Service = AgentService;

/**
 * Returns the checks the local agent is managing
 */

Agent.prototype.checks = function() {
  this.check.list.apply(this.check, arguments);
};

/**
 * Returns the services local agent is managing
 */

Agent.prototype.services = function() {
  this.service.list.apply(this.service, arguments);
};

/**
 * Returns the members as seen by the local consul agent
 */

Agent.prototype.members = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.members',
    path: '/agent/members',
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Reload agent configuration
 */

Agent.prototype.reload = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.reload',
    path: '/agent/reload',
  };

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Returns the local node configuration
 */

Agent.prototype.self = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.self',
    path: '/agent/self',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Manages node maintenance mode
 */

Agent.prototype.maintenance = function(opts, callback) {
  if (typeof opts === 'boolean') {
    opts = { enable: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.maintenance',
    path: '/agent/maintenance',
    query: { enable: opts.enable },
  };

  if (typeof opts.enable !== 'boolean') {
    return callback(this.consul._err(errors.Validation('enable required'), req));
  }
  if (opts.reason) req.query.reason = opts.reason;

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Trigger local agent to join a node
 */

Agent.prototype.join = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { address: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.join',
    path: '/agent/join/{address}',
    params: { address: opts.address },
  };

  if (!opts.address) {
    return callback(this.consul._err(errors.Validation('address required'), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Force remove node
 */

Agent.prototype.forceLeave = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { node: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.forceLeave',
    path: '/agent/force-leave/{node}',
    params: { node: opts.node },
  };

  if (!opts.node) {
    return callback(this.consul._err(errors.Validation('node required'), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Module exports.
 */

exports.Agent = Agent;
