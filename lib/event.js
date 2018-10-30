/**
 * Events
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('./errors');
var utils = require('./utils');

/**
 * Initialize a new `Event` client.
 */

function Event(consul) {
  this.consul = consul;
}

/**
 * Fires a new user event
 */

Event.prototype.fire = function(opts, callback) {
  var options;
  if (arguments.length === 3) {
    options = {
      name: arguments[0],
      payload: arguments[1],
    };
    callback = arguments[2];
  } else if (typeof opts === 'string') {
    options = { name: opts };
  } else {
    options = opts;
  }

  options = utils.normalizeKeys(options);
  options = utils.defaults(options, this.consul._defaults);

  var req = {
    name: 'event.fire',
    path: '/event/fire/{name}',
    params: { name: options.name },
    query: {},
  };

  if (!options.name) {
    return callback(this.consul._err(errors.Validation('name required'), req));
  }

  var buffer;

  if (options.hasOwnProperty('payload')) {
    buffer = Buffer.isBuffer(options.payload);
    req.body = buffer ? options.payload : Buffer.from(options.payload);
  }
  if (options.node) req.query.node = options.node;
  if (options.service) req.query.service = options.service;
  if (options.tag) req.query.tag = options.tag;

  utils.options(req, options);

  this.consul._put(req, utils.body, function(err, data, res) {
    if (err) return callback(err, undefined, res);

    if (data.hasOwnProperty('Payload')) {
      data.Payload = utils.decode(data.Payload, { buffer: buffer });
    }

    callback(null, data, res);
  });
};

/**
 * Lists the most recent events an agent has seen
 */

Event.prototype.list = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { name: opts };
  } else if (!callback) {
    callback = opts;
    opts = {};
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'event.list',
    path: '/event/list',
    query: {},
  };

  if (opts.name) req.query.name = opts.name;

  utils.options(req, opts);

  this.consul._get(req, utils.body, function(err, data, res) {
    if (err) return callback(err, undefined, res);

    data.forEach(function(item) {
      if (!item.hasOwnProperty('Payload')) return;
      item.Payload = utils.decode(item.Payload, opts);
    });

    callback(null, data, res);
  });
};

/**
 * Module exports.
 */

exports.Event = Event;
