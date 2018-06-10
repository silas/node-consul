/**
 * Lock.
 */

'use strict';

/**
 * Module dependencies.
 */

var events = require('events');
var util = require('util');

var errors = require('./errors');
var utils = require('./utils');

/**
 * Constants
 */

var DEFAULT_LOCK_SESSION_NAME = 'Consul API Lock';
var DEFAULT_LOCK_SESSION_TTL = '15s';
var DEFAULT_LOCK_WAIT_TIME = '15s';
var DEFAULT_LOCK_WAIT_TIMEOUT = '1s';
var DEFAULT_LOCK_RETRY_TIME = '5s';

// magic flag 0x2ddccbc058a50c18
var LOCK_FLAG_VALUE = '3304740253564472344';

/**
 * Initialize a new `Lock` instance.
 */

function Lock(consul, opts) {
  events.EventEmitter.call(this);

  opts = utils.normalizeKeys(opts);

  this.consul = consul;
  this._opts = opts;
  this._defaults = utils.defaultCommonOptions(opts);

  if (opts.session) {
    switch (typeof opts.session) {
      case 'string':
        opts.session = { id: opts.session };
        break;
      case 'object':
        opts.session = utils.normalizeKeys(opts.session);
        break;
      default:
        throw errors.Validation('session must be an object or string');
    }
  } else {
    opts.session = {};
  }

  if (!opts.key) {
    throw errors.Validation('key required');
  } else if (typeof opts.key !== 'string') {
    throw errors.Validation('key must be a string');
  }
}

util.inherits(Lock, events.EventEmitter);

/**
 * Object meta
 */

Lock.meta = {};

/**
 * Acquire lock
 */

Lock.meta.acquire = { type: 'sync' };

Lock.prototype.acquire = function() {
  var self = this;

  if (self._ctx) throw new errors.Validation('lock in use');

  var ctx = self._ctx = new events.EventEmitter();

  ctx.key = self._opts.key;
  ctx.session = utils.clone(self._opts.session);
  ctx.index = '0';
  ctx.end = false;
  ctx.lockWaitTime = self._opts.lockwaittime || DEFAULT_LOCK_WAIT_TIME;
  ctx.lockWaitTimeout = utils.parseDuration(ctx.lockWaitTime) +
    utils.parseDuration(self._opts.lockwaittimeout || DEFAULT_LOCK_WAIT_TIMEOUT);
  ctx.lockRetryTime = utils.parseDuration(self._opts.lockretrytime || DEFAULT_LOCK_RETRY_TIME);
  ctx.state = 'session';
  ctx.value = self._opts.value || null;

  process.nextTick(function() {
    self._run(ctx);
  });
};

/**
 * Release lock
 */

Lock.meta.release = { type: 'sync' };

Lock.prototype.release = function() {
  var self = this;

  var ctx = self._ctx;

  if (!self._ctx) throw errors.Validation('no lock in use');

  delete self._ctx;

  process.nextTick(function() {
    self._release(ctx);
  });
};

/**
 * Error helper
 */

Lock.prototype._err = function(err, res) {
  var self = this;

  self.emit('error', err, res);
};

/**
 * Lock
 */

Lock.prototype._run = function(ctx) {
  if (ctx.end) return;

  switch (ctx.state) {
    case 'session':
      return this._session(ctx);
    case 'wait':
      return this._wait(ctx);
    case 'acquire':
      return this._acquire(ctx);
    case 'monitor':
      return this._monitor(ctx);
    default:
      throw new Error('invalid state: ' + ctx.state);
  }
};

/**
 * Create lock session
 */

Lock.prototype._session = function(ctx) {
  var self = this;

  if (!ctx.session.id) {
    var opts = utils.defaults({
      name: ctx.session.name || DEFAULT_LOCK_SESSION_NAME,
      ttl: ctx.session.ttl || DEFAULT_LOCK_SESSION_TTL,
      ctx: ctx,
    }, ctx.session, self._defaults, self.consul._defaults);

    self.consul.session.create(opts, function(err, data, res) {
      if (err) {
        err.message = 'session create: ' + err.message;
        return self._end(ctx, err, res);
      }

      ctx.session = {
        id: data.ID,
        ttl: opts.ttl,
      };

      ctx.state = 'wait';

      var renewTimeout = utils.parseDuration(ctx.session.ttl) / 2;

      // renew session
      ctx.renewSession = setInterval(function() {
        var opts = utils.defaults({
          id: ctx.session.id,
          timeout: renewTimeout,
          ctx: ctx,
        }, self._defaults, self.consul._defaults);

        self.consul.session.renew(opts, function(err, data, res) {
          if (err) self._end(ctx, err, res);
        });
      }, renewTimeout);

      return self._run(ctx);
    });

    return;
  }

  ctx.state = 'wait';

  process.nextTick(function() {
    self._run(ctx);
  });
};

/**
 * Wait for non-locked resource
 */

Lock.prototype._wait = function(ctx) {
  var self = this;

  var retry = function() {
    utils.setTimeoutContext(function() {
      self._run(ctx);
    }, ctx, ctx.lockRetryTime);
  };

  var opts = utils.defaults({
    key: ctx.key,
    wait: ctx.lockWaitTime,
    timeout: ctx.lockWaitTimeout,
    ctx: ctx,
    index: ctx.index,
  }, self._defaults, self.consul._defaults);

  self.consul.kv.get(opts, function(err, data, res) {
    if (err) return self._end(ctx, err, res);

    if (data) {
      // we try to use the same magic number as consul/api in an attempt to be
      // compatible
      if (data.Flags !== +LOCK_FLAG_VALUE) {
        err = errors.Validation('consul: lock: existing key does not match lock use');
        return self._end(ctx, err, res);
      }

      var newIndex = res.headers['x-consul-index'];
      if (utils.hasIndexChanged(newIndex, ctx.index)) ctx.index = newIndex;

      if (data.Session !== ctx.Session) {
        self.emit('retry', { leader: data.Session });
        return retry();
      }
    } else if (res.statusCode !== 404) {
      return self._end(ctx, new Error('consul: lock: error getting key'), res);
    }

    ctx.state = 'acquire';

    self._run(ctx);
  });
};

/**
 * Attempt to acquire lock
 */

Lock.prototype._acquire = function(ctx) {
  var self = this;

  var opts = utils.defaults({
    key: ctx.key,
    acquire: ctx.session.id,
    ctx: ctx,
    value: ctx.value,
    flags: LOCK_FLAG_VALUE,
  }, self._defaults, self.consul._defaults);

  self.consul.kv.set(opts, function(err, data, res) {
    if (err) return self._end(ctx, err, res);

    if (data !== true) {
      ctx.state = 'wait';

      return utils.setTimeoutContext(function() { self._run(ctx); }, ctx,
        ctx.lockRetryTime);
    }

    ctx.held = true;
    self.emit('acquire');

    ctx.state = 'monitor';

    self._run(ctx);
  });
};

/**
 * Monitor lock
 */

Lock.prototype._monitor = function(ctx) {
  var self = this;

  var monitor = ctx.monitor = self.consul.watch({
    method: self.consul.kv.get,
    options: utils.defaults({
      key: ctx.key,
      wait: ctx.lockWaitTime,
      timeout: ctx.lockWaitTimeout,
      index: ctx.index,
    }, self._defaults, self.consul._defaults),
  });

  var ttl = ctx.session.ttl && utils.parseDuration(ctx.session.ttl);

  // monitor updates
  if (ttl) {
    utils.setIntervalContext(function() {
      var time = monitor.updateTime();

      if (time && new Date() - time > ttl + 1000) {
        monitor.end();
      }
    }, ctx, Math.min(1000, ttl));
  }

  monitor.on('change', function(data) {
    if (data) {
      if (data.Session !== ctx.session.id) {
        return monitor.end();
      }
    }
  });

  monitor.on('error', function() {
    // ignore errors
  });

  monitor.on('end', function() {
    self._end(ctx);
  });
};

/**
 * Close context processes
 */

Lock.prototype._end = function(ctx, err, res) {
  var self = this;

  if (ctx.end) return;
  ctx.end = true;

  delete self._ctx;

  if (err) self._err(err, res);

  if (ctx.monitor) {
    ctx.monitor.removeAllListeners();
    ctx.monitor.end();

    delete ctx.monitor;
  }

  if (ctx.renewSession) {
    clearInterval(ctx.renewSession);

    var opts = utils.defaults({
      id: ctx.session.id,
      timeout: 1000,
    }, self._defaults, self.consul._defaults);

    self.consul.session.destroy(opts, function() {
      // ignore errors
    });

    delete ctx.renewSession;
  }

  // abort any pending requests
  ctx.emit('cancel');

  if (ctx.held) {
    ctx.held = false;
    self.emit('release');
  }

  self.emit('end');
};

/**
 * Release lock
 */

Lock.prototype._release = function(ctx) {
  var self = this;

  if (ctx.held) {
    var opts = utils.defaults({
      key: ctx.key,
      release: ctx.session.id,
      ctx: ctx,
      value: ctx.value,
      flags: LOCK_FLAG_VALUE,
    }, self._defaults, self.consul._defaults);

    self.consul.kv.set(opts, function(err, data) {
      if (err) return self._end(ctx, err);

      if (data !== true) {
        err = new Error('failed to release lock');
        return self._end(ctx, err);
      }

      self._end(ctx);
    });

    return;
  }

  process.nextTick(function() {
    self._end(ctx);
  });
};

/**
 * Module exports.
 */

exports.Lock = Lock;
