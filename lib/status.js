/**
 * Status information
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Initialize a new `Status` client.
 */

function Status(consul) {
  this.consul = consul;
}

/**
 * Returns the current Raft leader.
 */

Status.prototype.leader = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'status.leader',
    path: '/status/leader',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Returns the current Raft peer set
 */

Status.prototype.peers = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'status.peers',
    path: '/status/peers',
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Module exports.
 */

exports.Status = Status;
