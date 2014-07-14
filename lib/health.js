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

Health.prototype.node = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { node: opts };
  }

  this.consul._log(['debug', 'health', 'node'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    method: 'GET',
    path: { node: opts.node },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/health/node/{node}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the checks of a service
 */

Health.prototype.checks = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  this.consul._log(['debug', 'health', 'checks'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    path: { service: opts.service },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/health/checks/{service}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the nodes and health info of a service
 */

Health.prototype.service = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  this.consul._log(['debug', 'health', 'service'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    path: { service: opts.service },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;
  if (opts.tag) req.query.tag = opts.tag;
  if (opts.passing) req.query.passing = 'true';

  this.consul._get('/health/service/{service}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the checks in a given state
 */

Health.prototype.state = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { state: opts };
  }

  this.consul._log(['debug', 'health', 'state'], opts);

  opts = utils.normalizeKeys(opts);

  if (opts.state !== 'any' && constants.CHECK_STATE.indexOf(opts.state) < 0) {
    return callback(new Error('Invalid state: ' + opts.state));
  }

  var req = {
    path: { state: opts.state },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/health/state/{state}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module exports.
 */

exports.Health = Health;
