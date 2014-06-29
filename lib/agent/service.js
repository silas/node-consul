/**
 * Agent service
 */

'use strict';

/**
 * Module dependencies.
 */

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

AgentService.prototype.list = function(callback) {
  this.consul.emit('debug', 'agent.service.list');

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
 * Registers a new local service
 */

AgentService.prototype.register = function(options, callback) {
  if (typeof options === 'string') {
    options = { name: options };
  }

  this.consul.emit('debug', 'agent.service.register', options);

  options = utils.normalizeKeys(options);

  if (!options.name) return callback(new Error('name required'));

  var req = {
    method: 'PUT',
    path: '/agent/service/register',
    type: 'json',
    body: {},
  };

  req.body.Name = options.name;
  if (options.id) req.body.ID = options.name;
  if (options.tags) req.body.Tags = options.tags;
  if (options.hasOwnProperty('port')) req.body.Port = options.port;

  if (options.check) {
    var check = utils.normalizeKeys(options.check);

    req.body.Check = {};

    if (check.script && check.interval) {
      req.body.Check.Script = check.script;
      req.body.Check.Interval = check.interval;
    } else if (check.ttl) {
      req.body.Check.TTL = check.ttl;
    } else {
      return callback(new Error('script and interval, or ttl required'));
    }
    if (check.hasOwnProperty('notes')) req.body.Check.Notes = check.notes;
  }

  this.consul.request(req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Deregister a local service
 */

AgentService.prototype.deregister = function(options, callback) {
  if (typeof options === 'string') {
    options = { id: options };
  }

  this.consul.emit('debug', 'agent.service.deregister', options);

  options = utils.normalizeKeys(options);

  if (!options.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: '/agent/service/deregister/' + options.id,
  };

  this.consul.request(req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module Exports.
 */

exports.AgentService = AgentService;
