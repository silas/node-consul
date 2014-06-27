/**
 * Agent control
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Initialize a new `Agent` client.
 */

function Agent(consul) {
  this.consul = consul;
}

/**
 * Returns the checks the local agent is managing
 */

Agent.prototype.checks = function(callback) {
  this.consul.emit('debug', 'agent.checks');

  var req = {
    method: 'GET',
    path: '/agent/checks',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the services local agent is managing
 */

Agent.prototype.services = function(callback) {
  this.consul.emit('debug', 'agent.services');

  var req = {
    method: 'GET',
    path: '/agent/services',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the members as seen by the local serf agent
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
 * Registers a new local check
 */

Agent.prototype.registerCheck = function(options, callback) {
  this.consul.emit('debug', 'agent.registerCheck', options);

  options = utils.normalizeKeys(options);

  if (!options.name) return callback(new Error('name required'));

  var req = {
    method: 'PUT',
    path: '/agent/check/register',
    type: 'json',
    body: {},
  };

  if (options.hasOwnProperty('id')) req.body.Id = options.id;
  if (options.hasOwnProperty('name')) req.body.Name = options.name;
  if (options.script && options.interval) {
    req.body.Script = options.script;
    req.body.Interval = options.interval;
  } else if (options.ttl) {
    req.body.TTL = options.ttl;
  } else {
    return callback(new Error('script and name, or ttl required'));
  }
  if (options.hasOwnProperty('notes')) req.body.Notes = options.notes;

  this.consul.request(req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Deregister a local check
 */

Agent.prototype.deregisterCheck = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul.emit('debug', 'agent.deregisterCheck', options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: '/agent/check/deregister/' + options.id,
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
