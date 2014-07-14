/**
 * Catalog service
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * Initialize a new `CatalogService` client.
 */

function CatalogService(consul) {
  this.consul = consul;
}

/**
 * Lists services in a given DC
 */

CatalogService.prototype.list = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { dc: opts };
  }

  this.consul._log(['debug', 'catalogservice', 'list']);

  opts = utils.normalizeKeys(opts);

  var req = {
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/catalog/services', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists the nodes in a given service
 */

CatalogService.prototype.nodes = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { service: opts };
  }

  this.consul._log(['debug', 'catalogservice', 'nodes']);

  opts = utils.normalizeKeys(opts);

  var req = {
    path: { service: opts.service },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;
  if (opts.tag) req.query.tag = opts.tag;

  this.consul._get('/catalog/service/{service}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.CatalogService = CatalogService;
