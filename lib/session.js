/**
 * Session manipulation
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('./errors');
var utils = require('./utils');

/**
 * Initialize a new `Session` client.
 */

function Session(consul) {
  this.consul = consul;
}

/**
 * Creates a new session
 */

Session.prototype.create = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'session.create',
    path: '/session/create',
    query: {},
    type: 'json',
    body: {},
  };

  if (opts.lockdelay) req.body.LockDelay = opts.lockdelay;
  if (opts.name) req.body.Name = opts.name;
  if (opts.node) req.body.Node = opts.node;
  if (opts.checks) req.body.Checks = opts.checks;
  if (opts.behavior) req.body.Behavior = opts.behavior;
  if (opts.ttl) req.body.TTL = opts.ttl;

  utils.options(req, opts);

  this.consul._put(req, utils.body, callback);
};

/**
 * Destroys a given session
 */

Session.prototype.destroy = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'session.destroy',
    path: '/session/destroy/{id}',
    params: { id: opts.id },
    query: {},
  };

  if (!opts.id) {
    return callback(this.consul._err(errors.Validation('id required'), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Queries a given session
 */

Session.prototype.info = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'session.info',
    path: '/session/info/{id}',
    params: { id: opts.id },
    query: {},
  };

  if (!opts.id) {
    return callback(this.consul._err(errors.Validation('id required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.bodyItem, callback);
};

Session.prototype.get = Session.prototype.info;

/**
 * Lists sessions belonging to a node
 */

Session.prototype.node = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { node: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'session.node',
    path: '/session/node/{node}',
    params: { node: opts.node },
  };

  if (!opts.node) {
    return callback(this.consul._err(errors.Validation('node required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Lists all the active sessions
 */

Session.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'session.list',
    path: '/session/list',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Renews a TTL-based session
 */

Session.prototype.renew = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'session.renew',
    path: '/session/renew/{id}',
    params: { id: opts.id },
  };

  if (!opts.id) {
    return callback(this.consul._err(errors.Validation('id required'), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.body, callback);
};

/**
 * Module exports.
 */

exports.Session = Session;
