'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('consul:request');
var http = require('http');
var https = require('https');
var querystring = require('querystring');

var utils = require('./utils');

/**
 * Create new request
 */

function request(options, callback) {
  var timeout;

  if (!options.headers) options.headers = {};

  if (!utils.isEmpty(options.query)) {
    try {
      options.path += '?' + querystring.stringify(options.query);
    } catch (err) {
      err.message = 'query encode: ' + err.message;
      return callback(err);
    }
  }

  if (options.body) {
    var encode;

    switch (options.type) {
      case 'json':
        options.headers['content-type'] = 'application/json; charset=utf-8';
        encode = JSON.stringify;
        break;
      case 'form':
        options.headers['content-type'] = 'application/x-www-form-urlencoded; charset=utf-8';
        encode = querystring.stringify;
        break;
    }

    var isBuffer = Buffer.isBuffer(options.body);

    if (encode && !isBuffer) {
      try {
        options.body = encode(options.body);
      } catch (err) {
        err.message = options.type + ' encode: ' + err.message;
        return callback(err);
      }
    }

    if (!isBuffer) {
      options.body = new Buffer(options.body, 'utf8');
    }

    options.headers['content-length'] = options.body.length;
  }

  if (utils.isEmpty(options.headers)) delete options.headers;

  var done = false;
  var transport = options.protocol === 'https:' ? https : http;
  var opts = utils.pick(options, 'hostname', 'port', 'method', 'path',
                        'headers', 'auth');

  debug('req', opts);

  var req = transport.request(opts);

  req.on('error', function(err) {
    debug('res error', err);

    if (done) {
      if (timeout) clearTimeout(timeout);
      return;
    }
    done = true;

    callback(err);
  });

  if (options.timeout && options.timeout > 0) {
    timeout = setTimeout(function() {
      req.abort();
      req.emit('error', new Error('Timeout'));
    }, options.timeout);

    req.setTimeout(options.timeout, function() {
      req.emit('error', new Error('Timeout'));
    });
  }

  req.on('response', function(res) {
    var chunks = [];
    var bodyLength = 0;

    res.on('data', function(chunk) {
      chunks.push(chunk);
      bodyLength += chunk.length;
    });

    res.on('end', function() {
      if (done) return;
      done = true;

      if (timeout) clearTimeout(timeout);

      debug('res status', res.statusCode);
      debug('res headers', res.headers);

      if (chunks.length) {
        res.body = Buffer.concat(chunks, bodyLength);

        debug('res body', res.body);

        var contentType = (res.headers['content-type'] || '').split(';')[0];

        switch (contentType.trim()) {
          case 'application/json':
            try {
              res.body = JSON.parse(res.body.toString());
            } catch (err) {
              return callback(err);
            }
            break;
          case 'text/plain':
            res.body = res.body.toString();
            break;
        }
      }

      if (parseInt(res.statusCode / 100, 10) !== 2) {
        return callback(new Error(
          typeof res.body === 'string' ?
            res.body :
            http.STATUS_CODES[res.statusCode]
        ), res);
      }

      callback(null, res);
    });
  });

  req.end(options.body);
}

/**
 * Module Exports.
 */

module.exports = request;
