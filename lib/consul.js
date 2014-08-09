/**
 * Consul client
 */

'use strict';

/**
 * Module dependencies.
 */

var papi = require('papi');
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

function Consul(opts) {
  if (!(this instanceof Consul)) {
    return new Consul(opts);
  }

  opts = opts || {};

  if (!opts.baseUrl) {
    opts.baseUrl = (opts.secure ? 'https:' : 'http:') + '//' +
      (opts.host || '127.0.0.1') + ':' +
      (opts.port || '8500') + '/v1';
  }
  opts.name = 'consul';
  opts.type = 'json';

  papi.Client.call(this, opts);

  this.agent = new Agent(this);
  this.catalog = new Catalog(this);
  this.health = new Health(this);
  this.kv = new Kv(this);
  this.session = new Session(this);
  this.status = new Status(this);
}

util.inherits(Consul, papi.Client);

/**
 * Module exports.
 */

exports.Consul = Consul;
