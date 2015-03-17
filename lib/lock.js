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
 * Initialize a new `Lock` instance.
 */

function Lock(consul, opts) {
  var self = this;

  events.EventEmitter.call(self);

  opts = utils.normalizeKeys(opts);

  self.consul = consul;

  self._isHeld = false;
  self._lock = false;
  self._opts = opts;

  var error;

  if (!opts.session || typeof opts.session !== 'string') {
    error = errors.Validation('session is required');
  } else if (!opts.key || typeof opts.key !== 'string') {
    error = errors.Validation('key is required');
  } else if (opts.ttl) {
    var ttl = opts.ttl;
    delete opts.ttl;

    self._ttl = utils.parseDuration(ttl);

    if (!self._ttl) {
      error = errors.Validation('ttl is invalid: ' + ttl);
    } else if (self._ttl < 1000) {
      error = errors.Validation('ttl must be a least 1 second: ' + ttl);
    }
  }

  if (error) {
    process.nextTick(function() {
      return self.emit('error', error);
    });
  } else {
    return self._run();
  }
}

util.inherits(Lock, events.EventEmitter);

/**
 * Is the lock currently held
 */

Lock.prototype.isHeld = function() {
  return this._isHeld;
};

/**
 * Is the lock running
 */

Lock.prototype.isRunning = function() {
  return !this._end;
};

/**
 * Acquire lock
 */

Lock.prototype.acquire = function() {
  if (this._end) return;

  this._lock = true;

  this._resolve();
};

/**
 * Release lock
 */

Lock.prototype.release = function() {
  this._lock = false;

  this._resolve();
};

/**
 * End lock
 */

Lock.prototype.end = function() {
  if (this._end) return;
  this._end = true;

  this.emit('cancel');

  if (this._resolveID) {
    clearTimeout(this._resolveID);

    delete this._resolveID;
  }

  if (this._watch) {
    this._watch.end();

    delete this._watch;
  }
};

/**
 * Resolve
 */

Lock.prototype._resolve = function() {
  var self = this;

  // inflight request
  if (self._inflight) {
    return;
  }

  // check for state lock
  if (self._ttl && self._isHeld) {
    var updateTime = self._watch.updateTime();

    if (updateTime && new Date() - updateTime >= self._ttl) {
      self._isHeld = false;

      self.emit('change');
    }
  }

  // stop on end unless we're trying to release the lock
  if (self._end && self._lock) {
    return;
  }

  // already in requested state
  if (self._lock === self._isHeld) {
    return;
  }

  var opts = {
    key: self._opts.key,
    ctx: self,
    value: self._opts.value || 'Consul API Lock',
    timeout: 1000,
  };

  var lock = self._lock;

  if (lock) {
    opts.acquire = self._opts.session;
  } else {
    opts.release = self._opts.session;
  }

  self._inflight = true;

  self.consul.kv.set(opts, function(err, ok, res) {
    self._inflight = false;

    if (err) {
      // don't retry validation errors
      if (err.isValidation ||
          (res && (res.statusCode === 400 || res.body === 'Invalid session'))) {
        if (self._end) return;

        self.emit('error', err);

        return self.end();
      }
    }
  });
};

/**
 * Run
 */

Lock.prototype._run = function() {
  var self = this;

  if (self._end) return;
  if (self._watch) return;

  self._watch = self.consul.watch(self.consul.kv.get, {
    key: self._opts.key,
    wait: self._opts.wait,
  });

  self._watch.on('change', function(data) {
    var isHeld = self._isHeld;

    self._isHeld = !!(data && data.Session && data.Session === self._opts.session);

    // emit when isHeld changes
    if (isHeld !== self._isHeld) {
      self.emit('change');
    }

    self._resolve();
  });

  self._watch.on('error', function() {
    self._resolve();
  });

  self._resolveID = setInterval(
    function() { self._resolve(); },
    Math.max((self._ttl || 0) / 2, 1000)
  );
};

/**
 * Module exports.
 */

exports.Lock = Lock;
