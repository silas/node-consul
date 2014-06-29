/**
 * Consul client
 */

'use strict';

/**
 * Module dependencies.
 */

var events = require('events');
var util = require('util');

var Agent = require('./agent').Agent;
var Catalog = require('./catalog').Catalog;
var Health = require('./health').Health;
var Kv = require('./kv').Kv;
var Session = require('./session').Session;
var Status = require('./status').Status;
var request = require('./request');

/**
 * Initialize a new `Consul` client.
 */

function Consul(options) {
  if (!(this instanceof Consul)) {
    return new Consul(options);
  }

  events.EventEmitter.call(this);

  options = options || {};

  this.host = options.host || 'localhost';
  this.port = options.port || '8500';

  this.agent = new Agent(this);
  this.catalog = new Catalog(this);
  this.health = new Health(this);
  this.kv = new Kv(this);
  this.session = new Session(this);
  this.status = new Status(this);
}

util.inherits(Consul, events.EventEmitter);

/**
 * Request
 */

Consul.prototype.request = function(options, callback) {
  options.emit = this.emit.bind(this);
  options.protocol = 'http:';
  options.hostname = this.host;
  options.port = this.port;
  options.path = '/v1' + options.path;

  request(options, callback);
};

/**
 * Module Exports.
 */

exports.Consul = Consul;
