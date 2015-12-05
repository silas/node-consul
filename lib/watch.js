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

  self._context = { consul: consul };
  self._options = options;
  self._attempts = 0;
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
  return Math.min(Math.pow(2, ++this._attempts), 256) * 100;
};

/**
 * Error helper
 */

Watch.prototype._err = function(err, res) {
  var self = this;

  if (self._end) return;

  self.emit('error', err, res);

  if (res && res.statusCode === 400) return self.end();

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

      var newIndex = res.headers['x-consul-index'];

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
