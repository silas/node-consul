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
  this.consul._log(['debug', 'agentservice', 'list']);

  this.consul._get('/agent/services', function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Registers a new local service
 */

AgentService.prototype.register = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { name: opts };
  }

  this.consul._log(['debug', 'agentservice', 'register'], opts);

  opts = utils.normalizeKeys(opts);

  if (!opts.name) return callback(new Error('name required'));

  var req = {
    type: 'json',
    body: {},
  };

  req.body.Name = opts.name;
  if (opts.id) req.body.ID = opts.id;
  if (opts.tags) req.body.Tags = opts.tags;
  if (opts.hasOwnProperty('port')) req.body.Port = opts.port;

  if (opts.check) {
    var check = utils.normalizeKeys(opts.check);

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

  this.consul._put('/agent/service/register', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Deregister a local service
 */

AgentService.prototype.deregister = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { id: opts };
  }

  this.consul._log(['debug', 'agentservice', 'deregister'], opts);

  opts = utils.normalizeKeys(opts);

  if (!opts.id) return callback(new Error('id required'));

  var req = {
    method: 'GET',
    path: { id: opts.id },
  };

  this.consul._get('/agent/service/deregister/{id}', req, function(err) {
    if (err) return callback(err);

    callback();
  });
};

/**
 * Module Exports.
 */

exports.AgentService = AgentService;
