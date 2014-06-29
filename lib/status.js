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
  this.consul.emit('debug', 'status.leader');

  var req = {
    method: 'GET',
    path: '/status/leader',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Returns the current Raft peer set
 */

Status.prototype.peers = function(callback) {
  this.consul.emit('debug', 'status.peers');

  var req = {
    method: 'GET',
    path: '/status/peers',
  };

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    callback(null, res.body);
  });
};

/**
 * Module Exports.
 */

exports.Status = Status;
