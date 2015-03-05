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

function Watcher(consul, fn, opts, callback) {
  var self = this;

  opts.wait = opts.wait || '30s';
  opts.index = opts.index || 0;

  events.EventEmitter.call(self);

  self.consul = consul;

  if (typeof callback === 'function') {
    self.on('change', function(data, res) {
      callback(null, data, res);
    });
    self.on('error', callback);
  }

  self._fn = fn;
  self._opts = opts;
  self._attempts = 0;

  process.nextTick(function() {
    if (typeof fn !== 'function') {
      self._err(errors.Validation('fn is required'));
    } else {
      self._run();
    }
  });
}

util.inherits(Watcher, events.EventEmitter);

/**
 * Run
 */

Watcher.prototype._run = function() {
  var self = this;

  if (self._end) return;

  var opts = utils.clone(self._opts);
  opts.ctx = self;

  try {
    self._fn(opts, function(err, data, res) {
      if (err) return self._err(err, res);

      self._attempts = 0;

      var newIndex = parseInt(res.headers['x-consul-index'], 10);

      if (newIndex > self._opts.index) {
        self._opts.index = newIndex;

        self.emit('change', data, res);
      }

      process.nextTick(function() { self._run(); });
    });
  } catch (err) {
    self._err(err);
  }
};

Watcher.prototype._err = function(err, res) {
  var self = this;

  if (self._end) return;

  self.emit('error', err);

  if (err.isValidation) return self.end();
  if (res && res.statusCode === 400) return self.end();

  var delay = Math.min(Math.pow(2, ++self._attempts), 256);

  setTimeout(function() { self._run(); }, delay * 100);
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
 * Module exports.
 */

exports.Watcher = Watcher;
