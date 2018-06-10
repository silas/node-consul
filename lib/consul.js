/**
 * Consul client
 */

'use strict';

/**
 * Module dependencies.
 */

var papi = require('papi');
var util = require('util');

var Acl = require('./acl').Acl;
var Agent = require('./agent').Agent;
var Catalog = require('./catalog').Catalog;
var Event = require('./event').Event;
var Health = require('./health').Health;
var Kv = require('./kv').Kv;
var Lock = require('./lock').Lock;
var Query = require('./query').Query;
var Session = require('./session').Session;
var Status = require('./status').Status;
var Watch = require('./watch').Watch;
var utils = require('./utils');

/**
 * Initialize a new `Consul` client.
 */

function Consul(opts) {
  if (!(this instanceof Consul)) {
    return new Consul(opts);
  }

  opts = utils.defaults({}, opts);

  if (!opts.baseUrl) {
    opts.baseUrl = (opts.secure ? 'https:' : 'http:') + '//' +
      (opts.host || '127.0.0.1') + ':' +
      (opts.port || 8500) + '/v1';
  }
  opts.name = 'consul';
  opts.type = 'json';

  if (opts.defaults) {
    var defaults = utils.defaultCommonOptions(opts.defaults);
    if (defaults) this._defaults = defaults;
  }
  delete opts.defaults;

  papi.Client.call(this, opts);

  this.acl = new Consul.Acl(this);
  this.agent = new Consul.Agent(this);
  this.catalog = new Consul.Catalog(this);
  this.event = new Consul.Event(this);
  this.health = new Consul.Health(this);
  this.kv = new Consul.Kv(this);
  this.query = new Consul.Query(this);
  this.session = new Consul.Session(this);
  this.status = new Consul.Status(this);

  try {
    if (opts.promisify) {
      if (typeof opts.promisify === 'function') {
        papi.tools.promisify(this, opts.promisify);
      } else {
        papi.tools.promisify(this);
      }
    }
  } catch (err) {
    err.message = 'promisify: ' + err.message;
    throw err;
  }
}

util.inherits(Consul, papi.Client);

Consul.Acl = Acl;
Consul.Agent = Agent;
Consul.Catalog = Catalog;
Consul.Event = Event;
Consul.Health = Health;
Consul.Kv = Kv;
Consul.Lock = Lock;
Consul.Query = Query;
Consul.Session = Session;
Consul.Status = Status;
Consul.Watch = Watch;

/**
 * Object meta
 */

Consul.meta = {};

/**
 * Lock helper.
 */

Consul.meta.lock = { type: 'eventemitter' };

Consul.prototype.lock = function(opts) {
  return new Consul.Lock(this, opts);
};

/**
 * Watch helper.
 */

Consul.meta.watch = { type: 'eventemitter' };

Consul.prototype.watch = function(opts) {
  return new Consul.Watch(this, opts);
};

/**
 * Walk methods
 */

Consul.meta.walk = { type: 'sync' };

Consul.walk = Consul.prototype.walk = function() {
  return papi.tools.walk(Consul);
};

/**
 * Parse query meta
 */

Consul.meta.parseQueryMeta = { type: 'sync' };

Consul.parseQueryMeta = Consul.prototype.parseQueryMeta = function(res) {
  return utils.parseQueryMeta(res);
};

/**
 * Module exports.
 */

exports.Consul = Consul;
