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

Agent.prototype.members = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  this.consul.emit('debug', 'agent.members', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/agent/members',
    query: {},
  };

  if (options.wan) req.query.wan = '1';

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the local node configuration
 */

Agent.prototype.self = function(callback) {
  this.consul.emit('debug', 'agent.self');

  var req = {
    method: 'GET',
    path: '/agent/self',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Trigger local agent to join a node
 */

Agent.prototype.join = function(options, callback) {
  if (typeof options === 'string') {
    options = { address: options };
  }

  this.consul.emit('debug', 'agent.join', options);

  options = utils.normalizeKeys(options);

  if (!options.address) return callback(new Error('address required'));

  var req = {
    method: 'GET',
    path: '/agent/join/' + options.address,
    query: {},
  };

  if (options.wan) req.query.wan = '1';

  this.consul.request(req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Force remove node
 */

Agent.prototype.forceLeave = function(options, callback) {
  if (typeof options === 'string') {
    options = { node: options };
  }

  this.consul.emit('debug', 'agent.forceLeave', options);

  options = utils.normalizeKeys(options);

  if (!options.node) return callback(new Error('node required'));

  var req = {
    method: 'GET',
    path: '/agent/force-leave/' + options.node,
  };

  this.consul.request(req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module Exports.
 */

exports.Agent = Agent;
