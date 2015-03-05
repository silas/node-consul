/**
 * Helper functions
 */

'use strict';

/**
 * Body
 */

function body(request, next) {
  if (request.err) return next(false, request.err, undefined, request.res);

  next(false, null, request.res.body, request.res);
}

/**
 * Empty
 */

function empty(request, next) {
  if (request.err) return next(false, request.err, undefined, request.res);

  next(false, undefined, undefined, request.res);
}

/**
 * Normalize keys
 */

function normalizeKeys(obj) {
  var result = {};

  if (obj) {
    Object.keys(obj).forEach(function(name) {
      if (obj.hasOwnProperty(name)) {
        result[name.replace(/_/g, '').toLowerCase()] = obj[name];
      }
    });
  }

  return result;
}

/**
 * Common options
 */

function options(req, opts) {
  if (!req.query) req.query = {};

  if (opts.dc) req.query.dc = opts.dc;
  if (opts.wan) req.query.wan = '1';

  if (opts.consistent) {
    req.query.consistent = '1';
  } else if (opts.stale) {
    req.query.stale = '1';
  }

  if (opts.hasOwnProperty('index')) req.query.index = opts.index;
  if (opts.hasOwnProperty('wait')) req.query.wait = opts.wait;
  if (opts.hasOwnProperty('token')) req.query.token = opts.token;

  // papi
  if (opts.hasOwnProperty('ctx')) req.ctx = opts.ctx;
  if (opts.hasOwnProperty('timeout')) req.timeout = opts.timeout;
}

/**
 * Decode value
 */

function decode(value, opts) {
  if (value === null) return value;
  value = new Buffer(value, 'base64');
  if (!opts.buffer) value = value.toString();
  return value;
}

/**
 * Shallow clone
 */

function clone(src) {
  var dst = {};

  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dst[key] = src[key];
    }
  }

  return dst;
}

/**
 * Module exports
 */

exports.body = body;
exports.decode = decode;
exports.empty = empty;
exports.normalizeKeys = normalizeKeys;
exports.options = options;
exports.clone = clone;
