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
  switch (arguments.length) {
    case 4:
      // set(key, value, opts, callback)
      opts = arguments[2];
      opts.key = arguments[0];
      opts.value = arguments[1];
      callback = arguments[3];
      break;
    case 3:
      // set(key, value, callback)
      opts = {
        key: arguments[0],
        value: arguments[1],
      };
      callback = arguments[2];
      break;
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'kv.set',
    path: '/kv/{key}',
    params: { key: opts.key },
    query: {},
    type: 'text',
    body: opts.value || '',
  };

  if (!opts.key) {
    return callback(this.consul._err(errors.Validation('key required'), req));
  }
  if (!opts.hasOwnProperty('value')) {
    return callback(this.consul._err(errors.Validation('value required'), req));
  }

  if (opts.hasOwnProperty('cas')) req.query.cas = opts.cas;
  if (opts.hasOwnProperty('flags')) req.query.flags = opts.flags;
  if (opts.hasOwnProperty('acquire')) req.query.acquire = opts.acquire;
  if (opts.hasOwnProperty('release')) req.query.release = opts.release;

  utils.options(req, opts);

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

  this.consul._delete(req, utils.empty, callback);
};

Kv.meta.delete = { type: 'alias' };

Kv.prototype.delete = Kv.prototype.del;

/**
 * Module exports.
 */

exports.Kv = Kv;
