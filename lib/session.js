/**
 * Session manipulation
 */

'use strict';

/**
 * Module dependencies.
 */

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

  this.consul._log(['debug', 'session', 'create'], opts);

  opts = utils.normalizeKeys(opts);

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

  this.consul._log(['debug', 'session', 'destroy'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'session.destroy',
    path: '/session/destroy/{id}',
    params: { id: opts.id },
    query: {},
  };

  utils.options(req, opts);

  this.consul._delete(req, utils.empty, callback);
};

/**
 * Queries a given session
 */

Session.prototype.get = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  this.consul._log(['debug', 'session', 'info'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'session.get',
    path: '/session/info/{id}',
    params: { id: opts.id },
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, function(err, res) {
    if (err) return callback(err, undefined, res);

    if (res.body && res.body.length) {
      return callback(null, res.body[0], res);
    }

    callback(undefined, undefined, res);
  });
};

Session.prototype.info = Session.prototype.get;

/**
 * Lists sessions belonging to a node
 */

Session.prototype.node = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { node: opts };
  }

  this.consul._log(['debug', 'session', 'node'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'session.node',
    path: '/session/node/{node}',
    params: { node: opts.node },
    query: {},
  };

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

  this.consul._log(['debug', 'session', 'list'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'session.list',
    path: '/session/list',
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Module exports.
 */

exports.Session = Session;
