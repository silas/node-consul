"use strict";

require("should");

const async_ = require("async");
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const temp = require("temp").track();

const Consul = require("../../lib");

function bufferToString(value) {
  if (!value) return value;

  if (Buffer.isBuffer(value)) return value.toString();

  if (Array.isArray(value)) {
    return value.map(bufferToString);
  }

  if (typeof value === "object") {
    Object.keys(value).forEach(function (key) {
      value[key] = bufferToString(value[key]);
    });
  }

  return value;
}

function debugBuffer(name) {
  const debug = require("debug")(name);

  return function () {
    debug.apply(debug, bufferToString(Array.prototype.slice.call(arguments)));
  };
}

class Cluster {
  constructor() {
    this._started = false;
    this.process = {};
  }

  spawn(opts, callback) {
    const binPath = process.env.CONSUL_BIN || "consul";

    const args = ["agent"];

    Object.keys(opts).forEach(function (key) {
      args.push("-" + key);

      if (
        opts.hasOwnProperty(key) &&
        typeof opts[key] !== "boolean" &&
        opts[key] !== undefined
      ) {
        args.push("" + opts[key]);
      }
    });

    const jobs = {};

    jobs.dirPath = function (cb) {
      temp.mkdir({}, cb);
    };

    jobs.configFile = [
      "dirPath",
      (results, cb) => {
        const config = {
          primary_datacenter: "dc1",
          acl: {
            enabled: false,
          },
          enable_script_checks: true,
        };

        const filePath = path.join(results.dirPath, "config.json");

        fs.writeFile(filePath, JSON.stringify(config), function (err) {
          cb(err, filePath);
        });
      },
    ];

    jobs.process = [
      "configFile",
      "dirPath",
      (results, cb) => {
        args.push("-config-file");
        args.push(results.configFile);

        args.push("-data-dir");
        args.push(path.join(results.dirPath, opts.node, "data"));

        args.push("-pid-file");
        args.push(path.join(results.dirPath, opts.node, "pid"));

        const process = spawn(binPath, args);

        process.destroy = function () {
          process._destroyed = true;
          process.kill("SIGKILL");
        };

        this.process[opts.node] = process;

        let out = "";
        process.stdout.on("data", function (data) {
          out += data.toString();
        });
        process.stderr.on("data", function (data) {
          out += data.toString();
        });

        process.on("exit", function (code) {
          if (code !== 0 && !process._destroyed) {
            const err = new Error(
              "Server exited (" + opts.node + "): " + code + "\n"
            );
            err.message +=
              "Command: " + binPath + " " + JSON.stringify(args) + "\n";
            err.message += "Output:\n" + out;
            throw err;
          }
        });

        cb(null, process);
      },
    ];

    jobs.connected = [
      "process",
      (results, cb) => {
        const log = debugBuffer("consul:" + opts.bind);
        const token = opts.bootstrap ? "root" : "agent_master";
        const client = new Consul({
          host: opts.bind,
          defaults: { token: token },
        });

        client.on("log", log);

        async_.retry(
          1000,
          function (cb) {
            // wait until server starts
            if (opts.bootstrap) {
              client.kv
                .set("check", "ok")
                .then(() => cb())
                .catch((err) => {
                  log(err);
                  cb(err);
                });
            } else {
              client.agent
                .self()
                .then(() => cb())
                .catch((err) => {
                  log(err);
                  cb(err);
                });
            }
          },
          function (err) {
            if (err) {
              results.process.destroy();

              return cb(new Error("Failed to start: " + opts.node));
            }

            cb();
          }
        );
      },
    ];

    async_.auto(jobs, callback);
  }

  setup() {
    const self = this;

    return new Promise((resolve, reject) => {
      if (self._started) return reject(new Error("already started"));
      self._started = true;

      const jobs = {};

      const nodes = ["node1", "node2", "node3"];

      nodes.forEach(function (node, i) {
        i = i + 1;

        jobs["node" + i] = function (cb) {
          const opts = {
            node: node,
            datacenter: "dc1",
            bind: "127.0.0." + i,
            client: "127.0.0." + i,
          };

          if (i === 1) {
            opts.bootstrap = true;
            opts.server = true;
          }

          self.spawn(opts, cb);
        };
      });

      async_.auto(jobs, function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  teardown() {
    const self = this;

    return new Promise((resolve, reject) => {
      const jobs = {};

      jobs.kill = function (cb) {
        Object.keys(self.process).forEach(function (key) {
          self.process[key].destroy();
        });

        cb();
      };

      jobs.cleanup = [
        "kill",
        function (results, cb) {
          temp.cleanup(cb);
        },
      ];

      async_.auto(jobs, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

async function before(test) {
  test.cluster = new Cluster();

  await test.cluster.setup();

  for (let i = 1; i <= 3; i++) {
    const client = (test["c" + i] = new Consul({
      host: "127.0.0." + i,
      defaults: { token: "root" },
    }));
    client.on("log", debugBuffer("consul:" + "127.0.0." + i));
  }
}

async function after(test) {
  await test.cluster.teardown();
}

function skip() {}
skip.skip = skip;

exports.describe = process.env.ACCEPTANCE === "true" ? describe : skip;
exports.before = before;
exports.after = after;
