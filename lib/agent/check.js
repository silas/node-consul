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

AgentCheck.prototype.register = function(options, callback) {
  this.consul._log(['debug', 'agentcheck', 'register'], options);

  options = utils.normalizeKeys(options);

  if (!options.name) return callback(new Error('name required'));

  var req = {
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
    return callback(new Error('script and interval, or ttl required'));
  }
  if (options.hasOwnProperty('notes')) req.body.Notes = options.notes;

  this.consul._put('/agent/check/register', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Deregister a local check
 */

AgentCheck.prototype.deregister = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul._log(['debug', 'agentcheck', 'deregister'], options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: { id: options.id },
  };

  this.consul._get('/agent/check/deregister/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Mark a local test as passing
 */

AgentCheck.prototype.pass = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul._log(['debug', 'agentcheck', 'pass'], options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    path: { id: options.id },
    query: {},
  };

  if (options.note) req.query.note = options.note;

  this.consul._get('/agent/check/pass/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Mark a local test as warning
 */

AgentCheck.prototype.warn = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul._log(['debug', 'agentcheck', 'warn'], options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    path: { id: options.id },
    query: {},
  };

  if (options.note) req.query.note = options.note;

  this.consul._get('/agent/check/warn/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Mark a local test as critical
 */

AgentCheck.prototype.fail = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul._log(['debug', 'agentcheck', 'fail'], options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    path: { id: options.id },
    query: {},
  };

  if (options.note) req.query.note = options.note;

  this.consul._get('/agent/check/fail/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module Exports.
 */

exports.AgentCheck = AgentCheck;
