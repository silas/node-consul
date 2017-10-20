/**
 * Query manipulation
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('./errors');
var utils = require('./utils');

/**
 * Initialize a new `Query` client.
 */

function Query(consul) {
  this.consul = consul;
}

/**
 * Lists all queries
 */

Query.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.list',
    path: '/query',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Create a new query
 */

Query.prototype.create = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: { service: opts } };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.create',
    path: '/query',
    query: {},
    type: 'json',
  };

  try {
    this._params(req, opts);
    if (!req.body.Service || !req.body.Service.Service) {
      throw errors.Validation('service required');
    }
  } catch (err) {
    return callback(this.consul._err(err, req));
  }

  utils.options(req, opts, { near: true });

  this.consul._post(req, utils.body, callback);
};

/**
 * Gets a given query
 */

Query.prototype.get = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { query: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.get',
    path: '/query/{query}',
    params: { query: opts.query },
    query: {},
  };

  if (!opts.query) {
    return callback(this.consul._err(errors.Validation('query required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.bodyItem, callback);
};

/**
 * Update existing query
 */

Query.prototype.update = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.update',
    path: '/query/{query}',
    params: { query: opts.query },
    query: {},
    type: 'json',
  };

  try {
    if (!opts.query) throw errors.Validation('query required');
    this._params(req, opts);
    if (!req.body.Service || !req.body.Service.Service) {
      throw errors.Validation('service required');
    }
  } catch (err) {
    return callback(this.consul._err(err, req));
  }

  utils.options(req, opts, { near: true });

  this.consul._put(req, utils.empty, callback);
};

/**
 * Destroys a given query
 */

Query.prototype.destroy = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { query: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.destroy',
    path: '/query/{query}',
    params: { query: opts.query },
    query: {},
  };

  if (!opts.query) {
    return callback(this.consul._err(errors.Validation('query required'), req));
  }

  utils.options(req, opts);

  this.consul._delete(req, utils.empty, callback);
};

/**
 * Executes a given query
 */

Query.prototype.execute = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { query: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.execute',
    path: '/query/{query}/execute',
    params: { query: opts.query },
    query: {},
  };

  if (!opts.query) {
    return callback(this.consul._err(errors.Validation('query required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Explain a given query
 */

Query.prototype.explain = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { query: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'query.explain',
    path: '/query/{query}/explain',
    params: { query: opts.query },
    query: {},
  };

  if (!opts.query) {
    return callback(this.consul._err(errors.Validation('query required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.bodyItem, callback);
};

/**
 * Generate body for query create and update
 */

Query.prototype._params = function(req, opts) {
  var body = req.body || {};

  if (opts.name) body.Name = opts.name;
  if (opts.session) body.Session = opts.session;
  if (opts.token) {
    body.Token = opts.token;
    delete opts.token;
  }
  if (opts.near) body.Near = opts.near;
  if (opts.template) {
    var template = utils.normalizeKeys(opts.template);
    if (template.type || template.regexp) {
      body.Template = {};
      if (template.type) body.Template.Type = template.type;
      if (template.regexp) body.Template.Regexp = template.regexp;
    }
  }
  if (opts.service) {
    var service = utils.normalizeKeys(opts.service);
    body.Service = {};
    if (service.service) body.Service.Service = service.service;
    if (service.failover) {
      var failover = utils.normalizeKeys(service.failover);
      if (typeof failover.nearestn === 'number' || failover.datacenters) {
        body.Service.Failover = {};
        if (typeof failover.nearestn === 'number') {
          body.Service.Failover.NearestN = failover.nearestn;
        }
        if (failover.datacenters) {
          body.Service.Failover.Datacenters = failover.datacenters;
        }
      }
    }
    if (typeof service.onlypassing === 'boolean') {
      body.Service.OnlyPassing = service.onlypassing;
    }
    if (service.tags) body.Service.Tags = service.tags;
  }
  if (opts.dns) {
    var dns = utils.normalizeKeys(opts.dns);
    if (dns.ttl) body.DNS = { TTL: dns.ttl };
  }

  req.body = body;
};

/**
 * Module exports.
 */

exports.Query = Query;
