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

CatalogService.prototype.list = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (typeof options === 'string') {
    options = { dc: options };
  }

  this.consul.emit('debug', 'catalog.service.list');

  options = utils.normalizeKeys(options);

  var req = {
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul._get('/catalog/services', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists the nodes in a given service
 */

CatalogService.prototype.nodes = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (typeof options === 'string') {
    options = { service: options };
  }

  this.consul.emit('debug', 'catalog.service.nodes');

  options = utils.normalizeKeys(options);

  var req = {
    path: { service: options.service },
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.tag) req.query.tag = options.tag;

  this.consul._get('/catalog/service/{service}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.CatalogService = CatalogService;
