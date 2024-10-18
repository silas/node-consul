"use strict";

const async_ = require("async");
const should = require("should");

const helper = require("./helper");

helper.describe("Watch", function () {
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
    const key = "test";
    let count = 0;

    const changes = [];
    const updateTimes = [];
    const errors = [];

    const watch = this.c1.watch({
      method: this.c1.kv.get,
      options: { key: key, wait: "1ms" },
    });

    watch.on("change", (data) => {
      updateTimes.push(watch.updateTime());
      changes.push(data);
    });

    watch.on("error", (err) => {
      errors.push(err);
    });

    count++;
    await this.c1.kv.set(key, "1");

    count++;
    await this.c1.kv.set(key, "2");

    count++;
    await this.c1.kv.set(key, "3");

    count++;
    await this.c1.kv.del(key);

    await async_.until(
      (next) => {
        return next(null, changes.length === count + 1);
      },
      (next) => {
        setTimeout(next, 50);
      },
    );

    const values = changes.map((data) => data && data.Value);

    should(values).eql([undefined, "1", "2", "3", undefined]);

    should(watch.isRunning()).be.true();

    watch.end();
    should(watch.isRunning()).be.false();

    watch._run();

    should(watch.isRunning()).be.false();
    watch.end();

    should(updateTimes).not.be.empty();

    updateTimes.forEach(function (updateTime, i) {
      if (i === 0) return;
      should(updateTime).have.above(updateTimes[i - 1]);
    });
  });

  it("should not retry on 400 errors", async function () {
    const errors = [];

    const watch = this.c1.watch({ method: this.c1.kv.get });

    watch.on("error", (err) => {
      errors.push(err);
    });

    await async_.until(
      (next) => {
        return next(null, errors.length === 1);
      },
      (next) => {
        setTimeout(next, 50);
      },
    );

    should(watch).have.property("_attempts", 0);
    should(watch).have.property("_end", true);
  });

  it("should exponential retry", async function () {
    const todo = ["one", "two", "three"];

    const method = async function () {
      throw new Error(todo.shift());
    };

    let oneErr, twoErr;
    const time = +new Date();

    const watch = this.c1.watch({ method: method });

    return new Promise((resolve) => {
      watch.on("error", (err) => {
        err.time = +new Date();

        if (err.message === "one") {
          oneErr = err;
        } else if (err.message === "two") {
          twoErr = err;
        } else if (err.message === "three") {
          should(oneErr.time - time).be.approximately(0, 20);
          should(twoErr.time - oneErr.time).be.approximately(200, 20);
          should(err.time - twoErr.time).be.approximately(400, 20);

          watch.end();

          resolve();
        }
      });
    });
  });
});
