'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('consul:session');

var utils = require('./utils');

/**
 * Initialize a new `Session` client.
 */

function Session(consul) {
  this.consul = consul;
}

/**
 * Create
 */

Session.prototype.create = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  debug('create', options);

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
 * Destroy
 */

Session.prototype.destroy = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  debug('destroy', options);

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
 * Info
 */

Session.prototype.info = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  debug('info', options);

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

/**
 * Node
 */

Session.prototype.node = function(options, callback) {
  if (typeof options === 'string') {
    options = { name: options };
  }

  debug('node', options);

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
 * List
 */

Session.prototype.list = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  debug('list', options);

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
