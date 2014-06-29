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
 * Registers a new local check
 */

AgentCheck.prototype.register = function(options, callback) {
  this.consul.emit('debug', 'agent.check.register', options);

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

AgentCheck.prototype.deregister = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul.emit('debug', 'agent.check.deregister', options);

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
 * Mark a local test as passing
 */

AgentCheck.prototype.pass = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul.emit('debug', 'agent.check.pass', options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: '/agent/check/pass/' + options.id,
    query: {},
  };

  if (options.note) req.query.note = options.note;

  this.consul.request(req, function(err) {
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

  this.consul.emit('debug', 'agent.check.warn', options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: '/agent/check/pass/' + options.id,
    query: {},
  };

  if (options.note) req.query.note = options.note;

  this.consul.request(req, function(err) {
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

  this.consul.emit('debug', 'agent.check.fail', options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: '/agent/check/pass/' + options.id,
    query: {},
  };

  if (options.note) req.query.note = options.note;

  this.consul.request(req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module Exports.
 */

exports.AgentCheck = AgentCheck;
