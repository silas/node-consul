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

function CatalogConnect(consul) {
  this.consul = consul;
}

/**
 * Lists the nodes in a given Connect-capable service
 */

CatalogConnect.prototype.nodes = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.connect.nodes',
    path: '/catalog/connect/{service}',
    params: { service: opts.service },
    query: {},
  };

  if (!opts.service) {
    return callback(this.consul._err(errors.Validation('service required'), req));
  }

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Module Exports.
 */

exports.CatalogConnect = CatalogConnect;
