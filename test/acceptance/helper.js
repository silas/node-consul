'use strict';

/**
 * Module dependencies.
 */

require('should');

var async = require('async');
var fs = require('fs');
var lodash = require('lodash');
var path = require('path');
var spawn = require('child_process').spawn;
var temp = require('temp').track();

var consul = require('../../lib');

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

Cluster.prototype.spawn = function(opts, callback) {
  var self = this;

  var binPath = process.env.CONSUL_BIN || 'consul';

  var args = ['agent'];

  Object.keys(opts).forEach(function(key) {
    args.push('-' + key);

    if (opts.hasOwnProperty(key) && typeof opts[key] !== 'boolean' &&
        opts[key] !== undefined) {
      args.push('' + opts[key]);
    }
  });

  var jobs = {};

  jobs.dirPath = function(cb) {
    temp.mkdir({}, cb);
  };

  jobs.configFile = ['dirPath', function(results, cb) {
    var config = {
      acl_datacenter: 'dc1',
      acl_master_token: 'root',
      acl_agent_master_token: 'agent_master',
      enable_script_checks: true,
    };

    var filePath = path.join(results.dirPath, 'config.json');

    fs.writeFile(filePath, JSON.stringify(config), function(err) {
      cb(err, filePath);
    });
  }];

  jobs.process = ['configFile', 'dirPath', function(results, cb) {
    args.push('-config-file');
    args.push(results.configFile);

    args.push('-data-dir');
    args.push(path.join(results.dirPath, opts.node, 'data'));

    args.push('-pid-file');
    args.push(path.join(results.dirPath, opts.node, 'pid'));

    var process = spawn(binPath, args);

    process.destroy = function() {
      process._destroyed = true;
      process.kill('SIGKILL');
    };

    self.process[opts.node] = process;

    var out = '';
    process.stdout.on('data', function(data) { out += data.toString(); });
    process.stderr.on('data', function(data) { out += data.toString(); });

    process.on('exit', function(code) {
      if (code !== 0 && !process._destroyed) {
        var err = new Error('Server exited (' + opts.node + '): ' + code + '\n');
        err.message += 'Command: ' + binPath + ' ' + JSON.stringify(args) + '\n';
        err.message += 'Output:\n' + out;
        throw err;
      }
    });

    cb(null, process);
  }];

  jobs.connected = ['process', function(results, cb) {
    var log = debugBuffer('consul:' + opts.bind);
    var token = opts.bootstrap ? 'root' : 'agent_master';
    var client = consul({ host: opts.bind, defaults: { token: token } });

    client.on('log', log);

    async.retry(
      100,
      function(cb) {
        // wait until server starts
        if (opts.bootstrap) {
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

          return cb(new Error('Failed to start: ' + opts.node));
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
        datacenter: 'dc1',
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

  jobs.cleanup = ['kill', function(results, cb) {
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
      client = test['c' + i] = consul({ host: '127.0.0.' + i, defaults: { token: 'root' } });
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

exports.describe = process.env.ACCEPTANCE === 'true' ? describe : lodash.noop;
exports.before = before;
exports.after = after;
