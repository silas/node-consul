/**
 * Helper functions
 */

'use strict';

/**
 * Body
 */

function body(ctx, next) {
  if (ctx.err) return next(false, ctx.err, undefined, ctx.res);

  next(false, null, ctx.res.body, ctx.res);
}

/**
 * Empty
 */

function empty(ctx, next) {
  if (ctx.err) return next(false, ctx.err, undefined, ctx.res);

  next(false, undefined, undefined, ctx.res);
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
}

/**
 * Module exports
 */

exports.body = body;
exports.empty = empty;
exports.normalizeKeys = normalizeKeys;
exports.options = options;
