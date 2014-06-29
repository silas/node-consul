'use strict';

/**
 * Module dependencies.
 */

var async = require('async');
var path = require('path');
var spawn = require('child_process').spawn;
var temp = require('temp').track();

var consul = require('../lib');

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

  if (process.env.CONSUL_UI_DIR) {
    options['ui-dir'] = process.env.CONSUL_UI_DIR;
  }

  var args = ['agent'];

  Object.keys(options).forEach(function(key) {
    args.push('-' + key);

    if (options.hasOwnProperty(key) && typeof options[key] !== 'boolean') {
      args.push('' + options[key]);
    }
  });

  var client = consul({ host: options.bind });

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
        var err = new Error('Server existed (' + options.node + ')\n');
        err.message += 'Command: ' + binPath + ' ' + JSON.stringify(args) + '\n';
        err.message += 'Output:\n' + out;
        throw err;
      }
    });

    cb(null, process);
  }];

  jobs.connected = ['process', function(cb, results) {
    var started = false;
    var count = 0;

    async.until(
      function() {
        return started || count > 1000;
      },
      function(cb) {
        count++;

        // wait until server starts
        if (options.bootstrap) {
          client.kv.set('check', 'ok', function(err) {
            if (err) return setTimeout(function() { cb(); }, 10);

            started = true;

            cb();
          });
        } else {
          client.agent.self(function(err) {
            if (err) return setTimeout(function() { cb(); }, 10);

            started = true;

            cb();
          });
        }
      },
      function(err) {
        if (err || !started) {
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

    for (var i = 1; i <= 3; i++) {
      test['c' + i] = consul({ host: '127.0.0.' + i });
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
