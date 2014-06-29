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

  this.consul.emit('debug', 'session.create', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'PUT',
    path: '/session/create',
    query: {},
    type: 'json',
    body: {},
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.hasOwnProperty('lockdelay')) req.body.LockDelay = options.lockdelay;
  if (options.hasOwnProperty('name')) req.body.Name = options.name;
  if (options.hasOwnProperty('node')) req.body.Node = options.node;
  if (options.hasOwnProperty('checks')) req.body.Checks = options.checks;

  this.consul.request(req, function(err, res) {
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

  this.consul.emit('debug', 'session.destroy', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'DELETE',
    path: '/session/destroy/' + options.id,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err) {
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

  this.consul.emit('debug', 'session.info', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/session/info/' + options.id,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
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
    options = { name: options };
  }

  this.consul.emit('debug', 'session.node', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/session/node/' + options.name,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
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

  this.consul.emit('debug', 'session.list', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/session/list',
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

exports.Session = Session;
