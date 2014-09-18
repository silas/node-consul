/**
 * Catalog node
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * Initialize a new `CatalogNode` client.
 */

function CatalogNode(consul) {
  this.consul = consul;
}

/**
 * Lists nodes in a given DC
 */

CatalogNode.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { dc: opts };
  }

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'catalog.node.list',
    path: '/catalog/nodes',
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Lists the services provided by a node
 */

CatalogNode.prototype.services = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { node: opts };
  }

  opts = utils.normalizeKeys(opts);

  var req = {
    name: 'catalog.node.services',
    path: '/catalog/node/{node}',
    params: { node: opts.node },
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Module Exports.
 */

exports.CatalogNode = CatalogNode;
