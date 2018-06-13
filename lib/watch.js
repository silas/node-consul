/**
 * Watch.
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
 * Initialize a new `Watch` instance.
 */

function Watch(consul, opts) {
  var self = this;

  events.EventEmitter.call(self);

  opts = utils.normalizeKeys(opts);

  var options = utils.normalizeKeys(opts.options || {});
  options = utils.defaults(options, consul._defaults);
  options.wait = options.wait || '30s';
  options.index = options.index || '0';

  if (typeof options.timeout !== 'string' && typeof options.timeout !== 'number') {
    var wait = utils.parseDuration(options.wait);
    // A small random amount of additional wait time is added to the supplied
    // maximum wait time to spread out the wake up time of any concurrent
    // requests. This adds up to wait / 16 additional time to the maximum duration.
    options.timeout = Math.ceil(wait + Math.max(wait * 0.1, 500));
  }

  var backoffFactor = 100;
  if (opts.hasOwnProperty('backofffactor') && typeof opts.backofffactor === 'number') {
    backoffFactor = opts.backofffactor;
  }
  var backoffMax = 30 * 1000;
  if (opts.hasOwnProperty('backoffmax') && typeof opts.backoffmax === 'number') {
    backoffMax = opts.backoffmax;
  }
  var maxAttempts = -1;
  if (opts.hasOwnProperty('maxattempts') && typeof opts.maxattempts === 'number') {
    maxAttempts = opts.maxattempts;
  }

  self._context = { consul: consul };
  self._options = options;
  self._attempts = 0;
  self._maxAttempts = maxAttempts;
  self._backoffMax = backoffMax;
  self._backoffFactor = backoffFactor;
  self._method = opts.method;

  if (typeof opts.method !== 'function') {
    throw errors.Validation('method required');
  }

  process.nextTick(function() { self._run(); });
}

util.inherits(Watch, events.EventEmitter);

/**
 * Object meta
 */

Watch.meta = {};

/**
 * Is running
 */

Watch.meta.isRunning = { type: 'sync' };

Watch.prototype.isRunning = function() {
  return !this._end;
};

/**
 * Update time
 */

Watch.meta.updateTime = { type: 'sync' };

Watch.prototype.updateTime = function() {
  return this._updateTime;
};

/**
 * End watch
 */

Watch.meta.end = { type: 'sync' };

Watch.prototype.end = function() {
  if (this._end) return;
  this._end = true;

  this.emit('cancel');
  this.emit('end');
};

/**
 * Wait
 */

Watch.prototype._wait = function() {
  this._attempts += 1;
  if (this._attemptsMaxed) {
    return this._backoffMax;
  }
  var timeout = Math.pow(2, this._attempts) * this._backoffFactor;
  if (timeout < this._backoffMax) {
    return timeout;
  } else {
    this._attemptsMaxed = true;
    return this._backoffMax;
  }
};

/**
 * Error helper
 */

Watch.prototype._err = function(err, res) {
  var self = this;

  if (self._end) return;

  self.emit('error', err, res);

  if (err && err.isValidation) return self.end();
  if (res && res.statusCode === 400) return self.end();
  if (self._maxAttempts >= 0 && self._attempts >= self._maxAttempts) return self.end();

  utils.setTimeoutContext(function() { self._run(); }, self, self._wait());
};

/**
 * Run
 */

Watch.prototype._run = function() {
  var self = this;

  if (self._end) return;

  var opts = utils.clone(self._options);
  opts.ctx = self;

  try {
    self._method.call(self._context, opts, function(err, data, res) {
      if (err) {
        return self._err(err, res);
      }

      self._updateTime = +new Date();

      self._attempts = 0;
      self._attemptsMaxed = false;

      var newIndex = res.headers['x-consul-index'];

      if (newIndex === undefined) {
        return self._err(errors.Validation('Watch not supported'), res);
      }

      if (utils.hasIndexChanged(newIndex, self._options.index)) {
        self._options.index = newIndex;

        self.emit('change', data, res);
      }

      process.nextTick(function() { self._run(); });
    });
  } catch (err) {
    self._err(err);
  }
};

/**
 * Module exports.
 */

exports.Watch = Watch;
