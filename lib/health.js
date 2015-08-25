/**
 * Health information
 */

'use strict';

/**
 * Module dependencies.
 */

var constants = require('./constants');
var errors = require('./errors');
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

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'health.node',
    path: '/health/node/{node}',
    params: { node: opts.node },
  };

  if (!opts.node) {
    return callback(this.consul._err(errors.Validation('node required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Returns the checks of a service
 */

Health.prototype.checks = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'health.checks',
    path: '/health/checks/{service}',
    params: { service: opts.service },
  };

  if (!opts.service) {
    return callback(this.consul._err(errors.Validation('service required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Returns the nodes and health info of a service
 */

Health.prototype.service = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'health.service',
    path: '/health/service/{service}',
    params: { service: opts.service },
    query: {},
  };

  if (!opts.service) {
    return callback(this.consul._err(errors.Validation('service required'), req));
  }

  if (opts.tag) req.query.tag = opts.tag;
  if (opts.passing) req.query.passing = 'true';

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Returns the checks in a given state
 */

Health.prototype.state = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { state: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'health.state',
    path: '/health/state/{state}',
    params: { state: opts.state },
  };

  if (!opts.state) {
    return callback(this.consul._err(errors.Validation('state required'), req));
  }

  if (opts.state !== 'any' && constants.CHECK_STATE.indexOf(opts.state) < 0) {
    return callback(this.consul._err(errors.Validation('state invalid: ' + opts.state), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Module exports.
 */

exports.Health = Health;
