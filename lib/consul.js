'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('consul:consul');
var parseUrl = require('url').parse;

var Kv = require('./kv').Kv;
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

  this.url = parseUrl(options.url || 'http://localhost:8500/v1');
  this.kv = new Kv(this);
}

/**
 * Request
 */

Consul.prototype.request = function(options, callback) {
  // url
  options.protocol = this.url.protocol;
  options.hostname = this.url.hostname;
  if (this.url.port) options.port = this.url.port;
  options.path = this.url.path + options.path;

  request(options, callback);
};

/**
 * Module Exports.
 */

exports.Consul = Consul;
