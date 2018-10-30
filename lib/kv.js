/**
 * Key/Value store
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('./errors');
var utils = require('./utils');

/**
 * Initialize a new `Session` client.
 */

function Kv(consul) {
  this.consul = consul;
}

/**
 * Object meta
 */

Kv.meta = {};

/**
 * Get
 */

Kv.prototype.get = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { key: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'kv.get',
    path: '/kv/{key}',
    params: { key: (opts.key || '') },
    query: {},
  };

  if (opts.recurse) req.query.recurse = 'true';
  if (opts.raw) {
    req.query.raw = 'true';
    req.buffer = true;
  }

  utils.options(req, opts);

  this.consul._get(req, function(err, res) {
    if (res && res.statusCode === 404) return callback(undefined, undefined, res);
    if (err) return callback(err, undefined, res);
    if (opts.raw) return callback(null, res.body, res);

    if (res.body && Array.isArray(res.body) && res.body.length) {
      res.body.forEach(function(item) {
        if (!item.hasOwnProperty('Value')) return;
        item.Value = utils.decode(item.Value, opts);
      });
    } else {
      return callback(undefined, undefined, res);
    }

    if (!opts.recurse) return callback(null, res.body[0], res);

    callback(null, res.body, res);
  });
};

/**
 * Keys
 */

Kv.prototype.keys = function(opts, callback) {
  switch (typeof opts) {
    case 'string':
      opts = { key: opts };
      break;
    case 'function':
      callback = opts;
      opts = {};
      break;
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'kv.keys',
    path: '/kv/{key}',
    params: { key: (opts.key || '') },
    query: { keys: true },
  };

  if (opts.separator) req.query.separator = opts.separator;

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Set
 */

Kv.prototype.set = function(opts, callback) {
  var options;
  switch (arguments.length) {
    case 4:
      // set(key, value, opts, callback)
      options = arguments[2];
      options.key = arguments[0];
      options.value = arguments[1];
      callback = arguments[3];
      break;
    case 3:
      // set(key, value, callback)
      options = {
        key: arguments[0],
        value: arguments[1],
      };
      callback = arguments[2];
      break;
    default:
      options = opts;
  }

  options = utils.normalizeKeys(options);
  options = utils.defaults(options, this.consul._defaults);

  var req = {
    name: 'kv.set',
    path: '/kv/{key}',
    params: { key: options.key },
    query: {},
    type: 'text',
    body: options.value || '',
  };

  if (!options.key) {
    return callback(this.consul._err(errors.Validation('key required'), req));
  }
  if (!options.hasOwnProperty('value')) {
    return callback(this.consul._err(errors.Validation('value required'), req));
  }

  if (options.hasOwnProperty('cas')) req.query.cas = options.cas;
  if (options.hasOwnProperty('flags')) req.query.flags = options.flags;
  if (options.hasOwnProperty('acquire')) req.query.acquire = options.acquire;
  if (options.hasOwnProperty('release')) req.query.release = options.release;

  utils.options(req, options);

  this.consul._put(req, utils.body, callback);
};

/**
 * Delete
 */

Kv.prototype.del = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { key: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'kv.del',
    path: '/kv/{key}',
    params: { key: (opts.key || '') },
    query: {},
  };

  if (opts.recurse) req.query.recurse = 'true';

  if (opts.hasOwnProperty('cas')) req.query.cas = opts.cas;

  utils.options(req, opts);

  this.consul._delete(req, utils.body, callback);
};

Kv.meta.delete = { type: 'alias' };

Kv.prototype.delete = Kv.prototype.del;

/**
 * Module exports.
 */

exports.Kv = Kv;
