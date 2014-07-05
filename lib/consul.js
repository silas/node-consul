/**
 * Consul client
 */

'use strict';

/**
 * Module dependencies.
 */

var rapi = require('rapi');
var util = require('util');

var Agent = require('./agent').Agent;
var Catalog = require('./catalog').Catalog;
var Health = require('./health').Health;
var Kv = require('./kv').Kv;
var Session = require('./session').Session;
var Status = require('./status').Status;

/**
 * Initialize a new `Consul` client.
 */

function Consul(options) {
  if (!(this instanceof Consul)) {
    return new Consul(options);
  }

  options = options || {};

  if (!options.baseUrl) {
    options.baseUrl = (options.secure ? 'https:' : 'http:') + '//' +
      (options.host || '127.0.0.1') + ':' +
      (options.port || '8500') + '/v1';
  }

  rapi.Rapi.call(this, options);

  this.agent = new Agent(this);
  this.catalog = new Catalog(this);
  this.health = new Health(this);
  this.kv = new Kv(this);
  this.session = new Session(this);
  this.status = new Status(this);
}

util.inherits(Consul, rapi.Rapi);

/**
 * Request
 */

Consul.prototype.request = function(options, callback) {
  if (!options.type) options.type = 'json';
  return rapi.Rapi.prototype.request.call(this, options, callback);
};

/**
 * Module Exports.
 */

exports.Consul = Consul;
