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

  this.acl = new Consul.Acl(this);
  this.agent = new Consul.Agent(this);
  this.catalog = new Consul.Catalog(this);
  this.event = new Consul.Event(this);
  this.health = new Consul.Health(this);
  this.kv = new Consul.Kv(this);
  this.session = new Consul.Session(this);
  this.status = new Consul.Status(this);
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

Consul.walk = Consul.prototype.walk = function(obj, name, tree) {
  if (arguments.length !== 3) {
    obj = Consul;
    name = 'Consul';
    tree = { name: name };
  }

  Object.keys(obj.prototype).forEach(function(key) {
    var v = obj.prototype[key];

    if (!key.match(/^[a-z]+/)) return;
    if (!tree.methods) tree.methods = {};

    tree.methods[key] = {
      name: key,
      value: v,
    };

    var meta = obj.meta || {};

    tree.methods[key].type = meta[key] && meta[key].type || 'callback';
  });

  Object.keys(obj).forEach(function(key) {
    var v = obj[key];

    if (!key.match(/^[A-Z]+/)) return;
    if (!tree.objects) tree.objects = {};

    tree.objects[key] = {
      name: key,
      value: v,
    };

    Consul.walk(v, key, tree.objects[key]);
  });

  return tree;
};

/**
 * Module exports.
 */

exports.Consul = Consul;
