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
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  this.consul._log(['debug', 'session', 'create'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    query: {},
    type: 'json',
    body: {},
  };

  if (opts.dc) req.query.dc = opts.dc;
  if (opts.lockdelay) req.body.LockDelay = opts.lockdelay;
  if (opts.name) req.body.Name = opts.name;
  if (opts.node) req.body.Node = opts.node;
  if (opts.checks) req.body.Checks = opts.checks;

  this.consul._put('/session/create', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
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
    path: { id: opts.id },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._delete('/session/destroy/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
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
    path: { id: opts.id },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/session/info/{id}', req, function(err, res) {
    if (err) return callback(err);

    if (res.body && res.body.length) {
      return callback(null, res.body[0]);
    }

    callback();
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
    path: { node: opts.node },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/session/node/{node}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists all the active sessions
 */

Session.prototype.list = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  this.consul._log(['debug', 'session', 'list'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/session/list', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module exports.
 */

exports.Session = Session;
