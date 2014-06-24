'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('consul:kv');

/**
 * Initialize a new `Consul` client.
 */

function Kv(consul) {
  this.consul = consul;
}

/**
 * Get
 */

Kv.prototype.get = function(options, callback) {
  if (typeof options === 'string') {
    options = { key: options };
  }

  debug('get', options);

  var req = {
    method: 'GET',
    path: '/kv/' + (options.key || ''),
    query: {},
    accept: 'json',
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.recurse) req.query.recurse = 'true';
  if (options.hasOwnProperty('index')) req.query.index = options.index;
  if (options.hasOwnProperty('wait')) req.query.wait = options.wait;

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    if (res.statusCode === 404) return callback();

    if (res.body && Array.isArray(res.body)) {
      res.body.forEach(function(item) {
        item.Value = new Buffer(item.Value, 'base64').toString();
      });
    }

    if (!res.body.length) return callback();

    if (!options.recurse) return callback(null, res.body[0]);

    callback(null, res.body);
  });
};

/**
 * Set
 */

Kv.prototype.set = function(options, callback) {
  switch (arguments.length) {
    case 4:
      // set(key, value, options, callback)
      options = arguments[2];
      options.key = arguments[0];
      options.value = arguments[1];
      callback = arguments[3];
      break;
    case 3:
      // set(key, value, callback)
      options = {
        key: arguments[0],
        value: arguments[1],
      };
      callback = arguments[2];
      break;
  }

  debug('set', options);

  if (!options.key) return callback(new Error('key required'));
  if (!options.hasOwnProperty('value')) return callback(new Error('value required'));

  var req = {
    method: 'PUT',
    path: '/kv/' + options.key,
    query: {},
    accept: 'text',
    body: options.value,
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.hasOwnProperty('cas')) req.query.cas = options.cas;
  if (options.hasOwnProperty('flags')) req.query.flags = options.flags;
  if (options.hasOwnProperty('acquire')) req.query.acquire = options.acquire;
  if (options.hasOwnProperty('release')) req.query.release = options.acrelease;

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    var body = res.body.trim();

    if (body === 'true') return callback(null, true);
    if (body === 'false') return callback(null, false);

    callback(new Error('unknown response: ' + res.body));
  });
};

/**
 * Delete
 */

Kv.prototype.del = function(options, callback) {
  if (typeof options === 'string') {
    options = { key: options };
  }

  debug('del', options);

  var req = {
    method: 'DELETE',
    path: '/kv/' + (options.key || ''),
    query: {},
  };

  if (options.dc) req.query.dc = options.dc;
  if (options.recurse) req.query.recurse = 'true';

  this.consul.request(req, function(err, res) {
    if (err) return callback(err);

    if (res.statusCode !== 200) return callback(new Error('delete failed'));

    callback();
  });
};

/**
 * Module Exports.
 */

exports.Kv = Kv;
