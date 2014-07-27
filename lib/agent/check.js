/**
 * Agent check
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * Initialize a new `AgentCheck` client.
 */

function AgentCheck(consul) {
  this.consul = consul;
}

/**
 * Returns the checks the local agent is managing
 */

AgentCheck.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  this.consul._log(['debug', 'agentcheck', 'list']);

  var req = {
    name: 'agent.check.list',
    path: '/agent/checks',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Registers a new local check
 */

AgentCheck.prototype.register = function(opts, callback) {
  this.consul._log(['debug', 'agentcheck', 'register'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'agent.check.register',
    path: '/agent/check/register',
    type: 'json',
    body: {},
  };

  if (!opts.name) return callback(this.consul._err('name required', req));

  if (opts.hasOwnProperty('id')) req.body.Id = opts.id;
  if (opts.hasOwnProperty('name')) req.body.Name = opts.name;
  if (opts.script && opts.interval) {
    req.body.Script = opts.script;
    req.body.Interval = opts.interval;
  } else if (opts.ttl) {
    req.body.TTL = opts.ttl;
  } else {
    return callback(this.consul._err('script and interval, or ttl required', req));
  }
  if (opts.hasOwnProperty('notes')) req.body.Notes = opts.notes;

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Deregister a local check
 */

AgentCheck.prototype.deregister = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  this.consul._log(['debug', 'agentcheck', 'deregister'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'agent.check.deregister',
    path: '/agent/check/deregister/{id}',
    params: { id: opts.id },
  };

  if (!opts.id) return callback(this.consul._err('id required', req));

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
};

/**
 * Mark a local test as passing
 */

AgentCheck.prototype.pass = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  this.consul._log(['debug', 'agentcheck', 'pass'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'agent.check.pass',
    path: '/agent/check/pass/{id}',
    params: { id: opts.id },
    query: {},
  };

  if (!opts.id) return callback(this.consul._err('id required', req));

  if (opts.note) req.query.note = opts.note;

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
};

/**
 * Mark a local test as warning
 */

AgentCheck.prototype.warn = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  this.consul._log(['debug', 'agentcheck', 'warn'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'agent.check.warn',
    path: '/agent/check/warn/{id}',
    params: { id: opts.id },
    query: {},
  };

  if (!opts.id) return callback(this.consul._err('id required', req));

  if (opts.note) req.query.note = opts.note;

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
};

/**
 * Mark a local test as critical
 */

AgentCheck.prototype.fail = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  this.consul._log(['debug', 'agentcheck', 'fail'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'agent.check.fail',
    path: '/agent/check/fail/{id}',
    params: { id: opts.id },
    query: {},
  };

  if (!opts.id) return callback(this.consul._err('id required', req));

  if (opts.note) req.query.note = opts.note;

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
};

/**
 * Module Exports.
 */

exports.AgentCheck = AgentCheck;
