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

AgentService.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

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

  var req = {
    name: 'agent.service.register',
    path: '/agent/service/register',
    type: 'json',
    body: {},
  };

  if (!opts.name) return callback(this.consul._err('name required', req));

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
      return callback(this.consul._err('script and interval, or ttl required', req));
    }
    if (check.hasOwnProperty('notes')) req.body.Check.Notes = check.notes;
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

  var req = {
    name: 'agent.service.deregister',
    path: '/agent/service/deregister/{id}',
    params: { id: opts.id },
  };

  if (!opts.id) return callback(this.consul._err('id required', req));

  utils.options(req, opts);

  this.consul._get(req, utils.empty, callback);
};

/**
 * Module Exports.
 */

exports.AgentService = AgentService;
