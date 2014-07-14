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

Session.prototype.create = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  this.consul._log(['debug', 'session', 'create'], options);

  options = utils.normalizeKeys(options);

  var req = {
    query: {},
    type: 'json',
    body: {},
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.lockdelay) req.body.LockDelay = options.lockdelay;
  if (options.name) req.body.Name = options.name;
  if (options.node) req.body.Node = options.node;
  if (options.checks) req.body.Checks = options.checks;

  this.consul._put('/session/create', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Destroys a given session
 */

Session.prototype.destroy = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul._log(['debug', 'session', 'destroy'], options);

  options = utils.normalizeKeys(options);

  var req = {
    path: { id: options.id },
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul._delete('/session/destroy/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Queries a given session
 */

Session.prototype.get = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul._log(['debug', 'session', 'info'], options);

  options = utils.normalizeKeys(options);

  var req = {
    path: { id: options.id },
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

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

Session.prototype.node = function(options, callback) {
  if (typeof options === 'string') {
    options = { node: options };
  }

  this.consul._log(['debug', 'session', 'node'], options);

  options = utils.normalizeKeys(options);

  var req = {
    path: { node: options.node },
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul._get('/session/node/{node}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists all the active sessions
 */

Session.prototype.list = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  this.consul._log(['debug', 'session', 'list'], options);

  options = utils.normalizeKeys(options);

  var req = {
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul._get('/session/list', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module exports.
 */

exports.Session = Session;
