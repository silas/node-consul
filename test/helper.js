'use strict';

/**
 * Module dependencies.
 */

require('should');

var async = require('async');
var path = require('path');
var spawn = require('child_process').spawn;
var temp = require('temp').track();

var consul = require('../lib');

/**
 * Buffer to string
 */

function bufferToString(value) {
  if (!value) return value;

  if (Buffer.isBuffer(value)) return value.toString();

  if (Array.isArray(value)) {
    return value.map(bufferToString);
  }

  if (typeof value === 'object') {
    Object.keys(value).forEach(function(key) {
      value[key] = bufferToString(value[key]);
    });
  }

  return value;
}

/**
 * Debug (convert buffers to strings)
 */

function debugBuffer(name) {
  var debug = require('debug')(name);

  return function() {
    debug.apply(debug, bufferToString(Array.prototype.slice.call(arguments)));
  };
}

/**
 * Cluster
 */

function Cluster() {
  this._started = false;
  this.process = {};
}

Cluster.prototype.spawn = function(options, callback) {
  var self = this;

  var binPath = process.env.CONSUL_BIN || 'consul';

  var args = ['agent'];

  Object.keys(options).forEach(function(key) {
    args.push('-' + key);

    if (options.hasOwnProperty(key) && typeof options[key] !== 'boolean' &&
        options[key] !== undefined) {
      args.push('' + options[key]);
    }
  });

  var jobs = {};

  jobs.dirPath = function(cb) {
    temp.mkdir({}, cb);
  };

  jobs.process = ['dirPath', function(cb, results) {
    args.push('-data-dir');
    args.push(path.join(results.dirPath, options.node, 'data'));

    args.push('-pid-file');
    args.push(path.join(results.dirPath, options.node, 'pid'));

    var process = spawn(binPath, args);

    process.destroy = function() {
      process._destroyed = true;
      process.kill('SIGKILL');
    };

    self.process[options.node] = process;

    var out = '';
    process.stdout.on('data', function(data) { out += data.toString(); });
    process.stderr.on('data', function(data) { out += data.toString(); });

    process.on('exit', function(code) {
      if (code !== 0 && !process._destroyed) {
        var err = new Error('Server exited (' + options.node + '): ' + code + '\n');
        err.message += 'Command: ' + binPath + ' ' + JSON.stringify(args) + '\n';
        err.message += 'Output:\n' + out;
        throw err;
      }
    });

    cb(null, process);
  }];

  jobs.connected = ['process', function(cb, results) {
    var log = debugBuffer('consul:' + options.bind);
    var client = consul({ host: options.bind });

    client.on('log', log);

    async.retry(
      100,
      function(cb) {
        // wait until server starts
        if (options.bootstrap) {
          client.kv.set('check', 'ok', function(err) {
            if (err) log(err);
            if (err) return setTimeout(function() { cb(err); }, 100);
            cb();
          });
        } else {
          client.agent.self(function(err) {
            if (err) log(err);
            if (err) return setTimeout(function() { cb(err); }, 100);
            cb();
          });
        }
      },
      function(err) {
        if (err) {
          results.process.destroy();

          return cb(new Error('Failed to start: ' + options.node));
        }

        cb();
      }
    );
  }];

  async.auto(jobs, callback);
};

Cluster.prototype.setup = function(callback) {
  var self = this;

  if (self._started) return callback(new Error('already started'));
  self._started = true;

  var jobs = {};

  var nodes = ['node1', 'node2', 'node3'];

  nodes.forEach(function(node, i) {
    i = i + 1;

    jobs['node' + i] = function(cb) {
      var opts = {
        node: node,
        dc: 'dc1',
        bind: '127.0.0.' + i,
        client: '127.0.0.' + i,
      };

      if (i === 1) {
        opts.bootstrap = true;
        opts.server = true;
      }

      self.spawn(opts, cb);
    };
  });

  async.auto(jobs, function(err) {
    if (err) return callback(err);

    callback();
  });
};

Cluster.prototype.teardown = function(callback) {
  var self = this;

  var jobs = {};

  jobs.kill = function(cb) {
    Object.keys(self.process).forEach(function(key) {
      self.process[key].destroy();
    });

    cb();
  };

  jobs.cleanup = ['kill', function(cb) {
    temp.cleanup(cb);
  }];

  async.auto(jobs, callback);
};

/**
 * Before
 */

function before(test, callback) {
  test.cluster = new Cluster();

  test.cluster.setup(function(err) {
    if (err) return callback(err);

    var client;

    for (var i = 1; i <= 3; i++) {
      client = test['c' + i] = consul({ host: '127.0.0.' + i });
      client.on('log', debugBuffer('consul:' + '127.0.0.' + i));
    }

    callback();
  });
}

/**
 * After
 */

function after(test, callback) {
  test.cluster.teardown(callback);
}

/**
 * Module Exports
 */

exports.before = before;
exports.after = after;
