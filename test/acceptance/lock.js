"use strict";

const debug = require("debug")("acceptance:lock");
const should = require("should");

const helper = require("./helper");

helper.describe("Lock", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  beforeEach(async function () {
    await this.c1.kv.del({ recurse: true });
  });

  it("should work", async function () {
    const locks = {};

    const test = (key) => {
      return new Promise((resolve, reject) => {
        const prefix = "lock " + key + ": ";
        const lock = this.c1.lock({
          key: "test",
          lockRetryTime: "10ms",
        });

        lock.on("acquire", () => {
          debug(prefix + ": acquire");

          locks[key] = true;

          for (const [checkKey, enabled] of Object.entries(locks)) {
            if (checkKey !== key && enabled) {
              reject(`${key} acquired when ${checkKey} already locked`);
              return;
            }
          }

          lock.release();
        });

        lock.on("release", () => {
          debug(prefix + ": release");

          locks[key] = false;
        });

        lock.on("error", (err) => {
          debug(prefix + ": error: ", err);

          reject(err);
        });

        lock.on("end", () => {
          debug(prefix + ": end");

          delete locks[key];

          resolve();
        });

        lock.acquire();
      });
    };

    const tests = [];
    for (let i = 0; i < 50; i++) {
      tests.push(test(i.toString()));
    }

    try {
      await Promise.all(tests);
    } catch (err) {
      should(err).be.null();
    }
  });
});
