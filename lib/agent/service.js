/**
 * Agent service
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('../errors');
var utils = require('../utils');

/**
 * Initialize a new `AgentService` client.
 */

function AgentService(consul) {
  this.consul = consul;
}

/**
 * Returns the services local agent is managing
 */

AgentService.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.service.list',
    path: '/agent/services',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Registers a new local service
 */

AgentService.prototype.register = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { name: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.service.register',
    path: '/agent/service/register',
    type: 'json',
    body: {},
  };

  if (!opts.name) {
    return callback(this.consul._err(errors.Validation('name required'), req));
  }

  try {
    req.body = utils.createService(opts);
  } catch (err) {
    return callback(this.consul._err(errors.Validation(err.message), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Deregister a local service
 */

AgentService.prototype.deregister = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.service.deregister',
    path: '/agent/service/deregister/{id}',
    params: { id: opts.id },
  };

  if (!opts.id) {
    return callback(this.consul._err(errors.Validation('id required'), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Manages node maintenance mode
 */

AgentService.prototype.maintenance = function(opts, callback) {
  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'agent.service.maintenance',
    path: '/agent/service/maintenance/{id}',
    params: { id: opts.id },
    query: { enable: opts.enable },
  };

  if (!opts.id) {
    return callback(this.consul._err(errors.Validation('id required'), req));
  }
  if (typeof opts.enable !== 'boolean') {
    return callback(this.consul._err(errors.Validation('enable required'), req));
  }
  if (opts.reason) req.query.reason = opts.reason;

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Module Exports.
 */

exports.AgentService = AgentService;
