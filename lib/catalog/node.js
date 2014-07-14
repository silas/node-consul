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
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { dc: opts };
  }

  this.consul._log(['debug', 'catalognode', 'list'], opts);

  opts = utils.normalizeKeys(opts);

  var req = {
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/catalog/nodes', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Lists the services provided by a node
 */

CatalogNode.prototype.services = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { node: opts };
  }

  this.consul._log(['debug', 'catalognode', 'services']);

  opts = utils.normalizeKeys(opts);

  var req = {
    path: { node: opts.node },
    query: {},
  };

  if (opts.dc) req.query.dc = opts.dc;

  this.consul._get('/catalog/node/{node}', req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.CatalogNode = CatalogNode;
