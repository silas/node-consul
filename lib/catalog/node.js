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

  this.consul.emit('debug', 'catalog.node.list', options);

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/catalog/nodes',
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
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

  this.consul.emit('debug', 'catalog.node.services');

  options = utils.normalizeKeys(options);

  var req = {
    method: 'GET',
    path: '/catalog/node/' + options.node,
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.CatalogNode = CatalogNode;
