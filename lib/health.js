/**
 * Health information
 */

'use strict';

/**
 * Module dependencies.
 */

var constants = require('./constants');
var utils = require('./utils');

/**
 * Initialize a new `Health` client.
 */

function Health(consul) {
  this.consul = consul;
}

/**
 * Returns the health info of a node
 */

Health.prototype.node = function(options, callback) {
  if (typeof options === 'string') {
    options = { node: options };
  }

  this.consul.emit('debug', 'health.node', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/health/node/' + options.node,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the checks of a service
 */

Health.prototype.checks = function(options, callback) {
  if (typeof options === 'string') {
    options = { service: options };
  }

  this.consul.emit('debug', 'health.checks', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/health/checks/' + options.service,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the nodes and health info of a service
 */

Health.prototype.service = function(options, callback) {
  if (typeof options === 'string') {
    options = { service: options };
  }

  this.consul.emit('debug', 'health.service', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/health/service/' + options.service,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.tag) req.query.tag = options.tag;
  if (options.passing) req.query.passing = 'true';

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the checks in a given state
 */

Health.prototype.state = function(options, callback) {
  if (typeof options === 'string') {
    options = { state: options };
  }

  this.consul.emit('debug', 'health.state', options);

  options = utils.normalizeKeys(options);

  if (options.state !== 'any' && constants.CHECK_STATE.indexOf(options.state) < 0) {
    return callback(new Error('Invalid state: ' + options.state));
  }

  var req = {
    method: 'GET',
    path: '/health/state/' + options.state,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.Health = Health;
