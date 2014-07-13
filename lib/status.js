/**
 * Status information
 */

'use strict';

/**
 * Initialize a new `Status` client.
 */

function Status(consul) {
  this.consul = consul;
}

/**
 * Returns the current Raft leader.
 */

Status.prototype.leader = function(callback) {
  this.consul._log(['debug', 'status', 'leader']);

  this.consul._get('/status/leader', function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the current Raft peer set
 */

Status.prototype.peers = function(callback) {
  this.consul._log(['debug', 'status', 'peers']);

  this.consul._get('/status/peers', function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.Status = Status;
