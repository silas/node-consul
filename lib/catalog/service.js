/**
 * Catalog service
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('../errors');
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
  if (!callback) {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { dc: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.service.list',
    path: '/catalog/services',
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Lists the nodes in a given service
 */

CatalogService.prototype.nodes = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.service.nodes',
    path: '/catalog/service/{service}',
    params: { service: opts.service },
    query: {},
  };

  if (!opts.service) {
    return callback(this.consul._err(errors.Validation('service required'), req));
  }
  if (opts.tag) req.query.tag = opts.tag;

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Module Exports.
 */

exports.CatalogService = CatalogService;
