/**
 * Manage catalog
 */

'use strict';

/**
 * Module dependencies.
 */

var CatalogNode = require('./catalog/node').CatalogNode;
var CatalogService = require('./catalog/service').CatalogService;

/**
 * Initialize a new `Catalog` client.
 */

function Catalog(consul) {
  this.consul = consul;
  this.node = new CatalogNode(consul);
  this.service = new CatalogService(consul);
}

/**
 * Lists known datacenters
 */

Catalog.prototype.datacenters = function(callback) {
  this.consul._log(['debug', 'catalog', 'datacenters']);

  this.consul._get('/catalog/datacenters', function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists nodes in a given DC
 */

Catalog.prototype.nodes = function() {
  this.node.list.apply(this.node, arguments);
};

/**
 * Lists services in a given DC
 */

Catalog.prototype.services = function() {
  this.service.list.apply(this.service, arguments);
};

/**
 * Module exports.
 */

exports.Catalog = Catalog;
