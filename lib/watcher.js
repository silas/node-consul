/**
 * Watcher.
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
 * Initialize a new `Watcher` instance.
 */

function Watcher(consul, opts) {
  var self = this;

  events.EventEmitter.call(self);

  opts = utils.normalizeKeys(opts);
  opts.consul = consul;

  opts.options = utils.normalizeKeys(opts.options || {});
  opts.options.wait = opts.options.wait || '30s';
  opts.options.index = opts.options.index || 0;

  self._opts = opts;
  self._attempts = 0;

  process.nextTick(function() {
    if (typeof opts.method !== 'function') {
      self._err(errors.Validation('method is required'));
    } else {
      self._run();
    }
  });
}

util.inherits(Watcher, events.EventEmitter);

/**
 * Is running
 */

Watcher.prototype.isRunning = function() {
  return !this._end;
};

/**
 * Update time
 */

Watcher.prototype.updateTime = function() {
  return this._updateTime;
};

/**
 * End watch
 */

Watcher.prototype.end = function() {
  if (this._end) return;
  this._end = true;

  this.emit('cancel');
};

/**
 * Dleay
 */

Watcher.prototype._delay = function() {
  return Math.min(Math.pow(2, ++this._attempts), 256) * 100;
};

/**
 * Error helper
 */

Watcher.prototype._err = function(err, res) {
  var self = this;

  if (self._end) return;

  self.emit('error', err);

  if (err.isValidation) return self.end();
  if (res && res.statusCode === 400) return self.end();

  setTimeout(function() { self._run(); }, this._delay());
};

/**
 * Run
 */

Watcher.prototype._run = function() {
  var self = this;

  if (self._end) return;

  var opts = utils.clone(self._opts.options);
  opts.ctx = self;

  try {
    self._opts.method(opts, function(err, data, res) {
      if (err) return self._err(err, res);

      self._updateTime = +new Date();

      self._attempts = 0;

      var newIndex = parseInt(res.headers['x-consul-index'], 10);

      if (newIndex > self._opts.options.index) {
        self._opts.options.index = newIndex;

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

exports.Watcher = Watcher;
