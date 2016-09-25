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
var Session = require('./session').Session;
var Status = require('./status').Status;
var Watch = require('./watch').Watch;
var constants = require('./constants');
var utils = require('./utils');
var _ = require('lodash');

/**
 * Initialize a new `Consul` client.
 */

function Consul(options) {
  var opts = _.extend({}, options);

  if (!(this instanceof Consul)) {
    return new Consul(opts);
  }

  if (!opts.baseUrl) {
    opts.baseUrl = (opts.secure ? 'https:' : 'http:') + '//' +
      (opts.host || '127.0.0.1') + ':' +
      (opts.port || '8500') + '/v1';
  }
  opts.name = 'consul';
  opts.type = 'json';

  if (opts.defaults) {
    var rawDefaults = utils.normalizeKeys(opts.defaults);
    var defaults;

    constants.DEFAULT_OPTIONS.forEach(function(key) {
      if (!rawDefaults.hasOwnProperty(key)) return;
      if (!defaults) defaults = {};
      defaults[key] = rawDefaults[key];
    });

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
 * Module exports.
 */

exports.Consul = Consul;
