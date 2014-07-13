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

CatalogNode.prototype.list = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (typeof options === 'string') {
    options = { dc: options };
  }

  this.consul._log(['debug', 'catalognode', 'list'], options);

  options = utils.normalizeKeys(options);

  var req = {
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul._get('/catalog/nodes', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists the services provided by a node
 */

CatalogNode.prototype.services = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (typeof options === 'string') {
    options = { node: options };
  }

  this.consul._log(['debug', 'catalognode', 'services']);

  options = utils.normalizeKeys(options);

  var req = {
    path: { node: options.node },
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul._get('/catalog/node/{node}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.CatalogNode = CatalogNode;
