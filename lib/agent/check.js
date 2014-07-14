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

AgentCheck.prototype.list = function(callback) {
  this.consul._log(['debug', 'agentcheck', 'list']);

  this.consul._get('/agent/checks', function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Registers a new local check
 */

AgentCheck.prototype.register = function(opts, callback) {
  this.consul._log(['debug', 'agentcheck', 'register'], opts);

  opts = utils.normalizeKeys(opts);

  if (!opts.name) return callback(new Error('name required'));

  var req = {
    type: 'json',
    body: {},
  };

  if (opts.hasOwnProperty('id')) req.body.Id = opts.id;
  if (opts.hasOwnProperty('name')) req.body.Name = opts.name;
  if (opts.script && opts.interval) {
    req.body.Script = opts.script;
    req.body.Interval = opts.interval;
  } else if (opts.ttl) {
    req.body.TTL = opts.ttl;
  } else {
    return callback(new Error('script and interval, or ttl required'));
  }
  if (opts.hasOwnProperty('notes')) req.body.Notes = opts.notes;

  this.consul._put('/agent/check/register', req, function(err) {
    if (err) return callback(err);

    callback();
  });
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

  if (!opts.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: { id: opts.id },
  };

  this.consul._get('/agent/check/deregister/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
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

  if (!opts.id) return callback(new Error('id required'));

  var req = {
    path: { id: opts.id },
    query: {},
  };

  if (opts.note) req.query.note = opts.note;

  this.consul._get('/agent/check/pass/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
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

  if (!opts.id) return callback(new Error('id required'));

  var req = {
    path: { id: opts.id },
    query: {},
  };

  if (opts.note) req.query.note = opts.note;

  this.consul._get('/agent/check/warn/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
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

  if (!opts.id) return callback(new Error('id required'));

  var req = {
    path: { id: opts.id },
    query: {},
  };

  if (opts.note) req.query.note = opts.note;

  this.consul._get('/agent/check/fail/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module Exports.
 */

exports.AgentCheck = AgentCheck;
