"use strict";

require("should");

const async_ = require("async");
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const temp = require("temp").track();
const util = require("util");

const Consul = require("../../lib");

function bufferToString(value, depth) {
  if (!value) return value;
  if (!depth) depth = 0;
  if (depth > 10) return value;

  if (Buffer.isBuffer(value)) return value.toString();

  if (Array.isArray(value)) {
    return value.map((v) => bufferToString(v, depth+1));
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      value[k] = bufferToString(v, depth+1);
    }
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

  async spawn(opts) {
    const binPath = process.env.CONSUL_BIN || "consul";

    const args = ["agent"];
    for (const [key, value] of Object.entries(opts)) {
      args.push("-" + key);
      if (typeof value !== "boolean" && value !== undefined) {
        args.push("" + value);
      }
    }

    const serverDataPath = await util.promisify(temp.mkdir)({});
    const serverConfigPath = path.join(serverDataPath, "config.json");

    const serverConfig = {
      primary_datacenter: "dc1",
      acl: {
        enabled: false,
      },
      enable_script_checks: true,
    };
    await util.promisify(fs.writeFile)(
      serverConfigPath,
      JSON.stringify(serverConfig)
    );

    args.push("-config-file");
    args.push(serverConfigPath);
    args.push("-data-dir");
    args.push(path.join(serverDataPath, opts.node, "data"));
    args.push("-pid-file");
    args.push(path.join(serverDataPath, opts.node, "pid"));

    const server = spawn(binPath, args);

    server.destroy = () => {
      server._destroyed = true;
      server.kill("SIGKILL");
    };

    this.process[opts.node] = server;

    const serverLog = debugBuffer("consul:server:" + opts.node);
    server.stdout.on("data", (data) => serverLog(data));
    server.stderr.on("data", (data) => serverLog(data));

    server.on("exit", (code) => {
      if (code !== 0 && !server._destroyed) {
        const err = new Error(
          "Server exited (" + opts.node + "): " + code + "\n"
        );
        err.message += "Command: " + binPath + " " + JSON.stringify(args);
        throw err;
      }
    });

    const token = opts.bootstrap ? "root" : "agent_master";
    const client = new Consul({
      host: opts.bind,
      defaults: { token: token },
    });

    const clientLog = debugBuffer("consul:client:" + opts.node);
    client.on("log", clientLog);

    try {
      await async_.retry({ times: 100, interval: 100 }, async () => {
        // wait until server starts
        if (opts.bootstrap) {
          await client.kv.set("check", "ok");
        } else {
          await client.agent.self();
        }
      });
    } catch (err) {
      server.destroy();
    }
  }

  async setup() {
    if (this._started) return new Error("already started");
    this._started = true;

    const nodes = ["node1", "node2", "node3"].map((node, i) => {
      i = i + 1;

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

      return this.spawn(opts);
    });

    await Promise.all(nodes);
  }

  async teardown() {
    for (const server of Object.values(this.process)) {
      server.destroy();
    }

    await util.promisify(temp.cleanup)();
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
