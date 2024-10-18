"use strict";

const should = require("should");

const helper = require("./helper");

describe("Watch", function () {
  helper.setup(this);

  it("should work", function (done) {
    this.nock
      .get("/v1/kv/key1?index=0&wait=30s")
      .reply(200, [{ n: 1 }], { "X-Consul-Index": "5" })
      .get("/v1/kv/key1?index=5&wait=30s")
      .reply(200, [{ n: 2 }], { "X-Consul-Index": "5" })
      .get("/v1/kv/key1?index=5&wait=30s")
      .reply(500, [{ n: 3 }])
      .get("/v1/kv/key1?index=5&wait=30s")
      .reply(200, [{ n: 4 }], { "X-Consul-Index": "10" })
      .get("/v1/kv/key1?index=10&wait=30s")
      .reply(200, [{ n: 5 }], { "X-Consul-Index": "15" })
      .get("/v1/kv/key1?index=15&wait=30s")
      .reply(200, [{ n: 6 }], { "X-Consul-Index": "14" })
      .get("/v1/kv/key1?index=0&wait=30s")
      .reply(200, [{ n: 7 }], { "X-Consul-Index": "6" })
      .get("/v1/kv/key1?index=6&wait=30s")
      .reply(200, [{ n: 8 }], { "X-Consul-Index": "0" })
      .get("/v1/kv/key1?index=6&wait=30s")
      .reply(400);

    const watch = this.consul.watch({
      method: this.consul.kv.get,
      options: { key: "key1" },
    });

    let doneCalled = false;
    const safeDone = (err) => {
      if (doneCalled) return;
      doneCalled = true;
      done(err);
      watch.end();
    };

    should(watch.isRunning()).be.true();
    should(watch.updateTime()).be.undefined();

    // make tests run fast
    watch._wait = () => {
      return 1;
    };

    const errors = [];
    const list = [];
    const called = {};

    watch.on("error", (err) => {
      if (err.message.includes("Nock")) {
        return safeDone(err);
      }

      called.error = true;

      errors.push(err);
    });

    watch.on("cancel", () => {
      called.cancel = true;

      try {
        should(list).eql([1, 4, 5, 6, 7]);

        watch._run();
        watch._err();

        watch.end();
        should(watch.isRunning()).be.false();
      } catch (err) {
        safeDone(err);
      }
    });

    watch.on("change", (data, res) => {
      called.change = true;

      list.push(data.n);

      try {
        switch (res.headers["x-consul-index"]) {
          case "5":
            should(watch.isRunning()).be.true();
            should(watch.updateTime()).be.a.Number();
            should(errors).be.empty();
            break;
          case "10":
            should(watch.isRunning()).be.true();
            should(watch.updateTime()).be.a.Number();
            should(errors).have.length(1);
            should(errors[0]).have.property(
              "message",
              "consul: kv.get: internal server error",
            );
            break;
          case "15":
            break;
          default:
            break;
        }
      } catch (err) {
        safeDone(err);
      }
    });

    watch.on("end", () => {
      try {
        should(called).have.property("cancel", true);
        should(called).have.property("change", true);
        should(called).have.property("error", true);

        should(errors).have.length(3);
        should(errors[1]).have.property(
          "message",
          "Consul returned zero index value",
        );

        safeDone();
      } catch (err) {
        safeDone(err);
      }
    });
  });

  it("should error when endpoint does not support watch", function (done) {
    this.nock.get("/v1/agent/members?index=0&wait=30s").reply(200, [{ n: 1 }]);

    const watch = this.consul.watch({
      method: this.consul.agent.members,
    });

    const errors = [];
    const called = {};

    watch.on("error", (err) => {
      called.error = true;

      errors.push(err);
    });

    watch.on("cancel", () => {
      called.cancel = true;
    });

    watch.on("change", () => {
      called.change = true;
    });

    watch.on("end", () => {
      should(called).eql({ cancel: true, error: true });
      should(errors).have.length(1);
      should(errors[0]).have.property("isValidation", true);
      should(errors[0]).have.property("message", "Watch not supported");

      done();
    });
  });

  it("should use maxAttempts", function (done) {
    this.nock
      .get("/v1/kv/key1?index=0&wait=30s")
      .reply(500)
      .get("/v1/kv/key1?index=0&wait=30s")
      .reply(500);

    const watch = this.consul.watch({
      method: this.consul.kv.get,
      options: { key: "key1" },
      backoffFactor: 0,
      maxAttempts: 2,
    });

    should(watch.isRunning()).be.true;
    should(watch.updateTime()).be.undefined;

    const errors = [];

    watch.on("error", (err) => {
      errors.push(err);
    });

    watch.on("end", () => {
      should(errors).have.length(3);

      done();
    });
  });

  it("should require method", function () {
    should(() => {
      this.consul.watch({});
    }).throw("method required");
  });

  it("should set timeout correctly", async function () {
    const test = (options) => {
      const opts = { key: "test", method: async () => null };
      if (options) opts.options = options;
      return this.consul.watch(opts)._options.timeout;
    };

    should(test()).equal(33000);
    should(test({ timeout: 1000 })).equal(1000);
    should(test({ timeout: "1s" })).equal("1s");
    should(test({ wait: "60s" })).equal(66000);
    should(test({ wait: "1s" })).equal(1500);
    should(test({ wait: "33s" })).equal(36300);
  });

  describe("wait", function () {
    it("should work", function () {
      const watch = this.consul.watch({
        key: "test",
        method: async () => null,
      });

      should(watch._wait()).equal(200);
      should(watch._wait()).equal(400);
      should(watch._wait()).equal(800);
      should(watch._wait()).equal(1600);
      should(watch._wait()).equal(3200);

      for (let i = 0; i < 100; i++) {
        should(watch._wait()).be.below(30001);
      }
    });

    it("should use custom backoff settings", function () {
      const watch = this.consul.watch({
        key: "test",
        method: async () => null,
        backoffFactor: 500,
        backoffMax: 20000,
      });

      should(watch._wait()).equal(1000);
      should(watch._wait()).equal(2000);
      should(watch._wait()).equal(4000);
      should(watch._wait()).equal(8000);
      should(watch._wait()).equal(16000);

      for (let i = 0; i < 100; i++) {
        should(watch._wait()).be.below(20001);
      }
    });
  });

  describe("err", function () {
    it("should handle method throw", function (done) {
      const watch = this.consul.watch({
        method: async () => {
          throw new Error("ok");
        },
      });

      watch.on("error", (err) => {
        watch.end();
        if (err.message === "ok") {
          done();
        }
      });
    });
  });
});
