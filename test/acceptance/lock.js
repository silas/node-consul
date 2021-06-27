"use strict";

const async_ = require("async");
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

    await async_.times(50, (n, next) => {
      const c = this.c1;
      const prefix = "lock " + n + ": ";
      const lock = c.lock({
        key: "test",
        lockRetryTime: "10ms",
      });

      lock.on("acquire", () => {
        debug(prefix + ": acquire");

        locks[n] = true;

        locks.forEach((enabled, i) => {
          if (enabled && i !== n) {
            should(locks).not.have.property(i, enabled);
          }
        });

        lock.release();
      });

      lock.on("release", () => {
        debug(prefix + ": release");

        locks[n] = false;
      });

      lock.on("error", (err) => {
        debug(prefix + ": error: ", err);
      });

      lock.on("end", () => {
        debug(prefix + ": end");

        delete locks[n];

        next();
      });

      lock.acquire();
    });
  });
});
