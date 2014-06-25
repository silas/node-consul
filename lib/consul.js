'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('consul:consul');

var Agent = require('./agent').Agent;
var Kv = require('./kv').Kv;
var Session = require('./session').Session;
var request = require('./request');

/**
 * Initialize a new `Consul` client.
 */

function Consul(options) {
  if (!(this instanceof Consul)) {
    return new Consul(options);
  }

  options = options || {};

  debug('construct', options);

  this.host = options.host || 'localhost';
  this.httpPort = options.httpPort || '8500';

  this.agent = new Agent(this);
  this.kv = new Kv(this);
  this.session = new Session(this);
}

/**
 * Request
 */

Consul.prototype.request = function(options, callback) {
  options.protocol = 'http:';
  options.hostname = this.host;
  options.port = this.httpPort;
  options.path = '/v1' + options.path;

  request(options, callback);
};

/**
 * Module Exports.
 */

exports.Consul = Consul;
