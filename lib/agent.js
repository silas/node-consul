'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('consul:agent');

var utils = require('./utils');

/**
 * Initialize a new `Agent` client.
 */

function Agent(consul) {
  this.consul = consul;
}

/**
 * Checks
 */

Agent.prototype.checks = function(callback) {
  debug('checks');

  var req = {
    method: 'GET',
    path: '/agent/checks',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Services
 */

Agent.prototype.services = function(callback) {
  debug('services');

  var req = {
    method: 'GET',
    path: '/agent/services',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Members
 */

Agent.prototype.members = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  debug('members', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/agent/members',
    query: {},
  };

  if (options.wan) req.query.wan = '1';

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Self
 */

Agent.prototype.self = function(callback) {
  debug('self');

  var req = {
    method: 'GET',
    path: '/agent/self',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.Agent = Agent;
