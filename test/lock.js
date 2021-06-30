"use strict";

const events = require("events");
const should = require("should");

const consul = require("../lib");

const helper = require("./helper");

const FLAGS_IN = "3304740253564472344";
const FLAGS_OUT = 0x2ddccbc058a50c18;

describe("Lock", function () {
  helper.setup(this);

  beforeEach(function () {
    const ctx = new events.EventEmitter();
    ctx.key = "test";
    ctx.lockWaitTime = "15s";
    ctx.lockWaitTimeout = 16000;
    ctx.lockRetryTime = 5000;
    ctx.index = 0;
    ctx.session = { id: "session123", ttl: "15s" };
    ctx.end = false;
    ctx.includeResponse = true;

    const lock = this.consul.lock({ key: ctx.key });
    lock._ctx = ctx;

    this.ctx = ctx;
    this.lock = lock;
  });

  describe("constructor", function () {
    it("should require valid options", function () {
      const checks = [
        {
          opts: { session: true },
          message: "session must be an object or string",
        },
        { opts: { session: "ok" }, message: "key required" },
        { opts: { session: {} }, message: "key required" },
        { opts: {}, message: "key required" },
        { opts: { key: true }, message: "key must be a string" },
      ];

      checks.forEach((check) => {
        should(() => {
          this.consul.lock(check.opts);
        }).throw(check.message);
      });
    });
  });

  describe("acquire", function () {
    it("should create ctx", function (done) {
      delete this.lock._ctx;

      this.lock._run = (ctx) => {
        should(ctx).have.property("key", "test");
        should(ctx).have.property("index", "0");
        should(ctx).have.property("end", false);
        should(ctx).have.property("lockWaitTime", "15s");
        should(ctx).have.property("lockWaitTimeout", 16000);
        should(ctx).have.property("lockRetryTime", 5000);
        should(ctx).have.property("state", "session");
        should(ctx).have.property("value", null);

        done();
      };

      this.lock.acquire();
    });

    it("should error for activate lock", function () {
      should(() => {
        this.lock.acquire();
      }).throw("lock in use");
    });
  });

  describe("release", function () {
    it("should require activate lock", function () {
      delete this.lock._ctx;

      should(() => {
        this.lock.release();
      }).throw("no lock in use");
    });
  });

  describe("_err", function () {
    it("should emit error", function (done) {
      this.lock.once("error", (err, res) => {
        should(err).have.property("message", "ok");
        should(res).equal("res");

        done();
      });

      this.lock._err(new Error("ok"), "res");
    });
  });

  describe("_run", function () {
    it("should do nothing when ctx ended", function () {
      this.lock.on("end", () => {
        throw new Error("should not end");
      });

      this.ctx.end = true;
      this.lock._run(this.ctx);
    });

    it("should throw on unknown state", function () {
      this.ctx.state = "foo";

      should(() => {
        this.lock._run(this.ctx);
      }).throw("invalid state: foo");
    });
  });

  describe("_session", function () {
    beforeEach(function () {
      this.lock._run = () => {};
      this.ctx.session = { ttl: "100ms" };
    });

    it("should end when create fails", function (done) {
      this.nock.put("/v1/session/create").reply(500);

      let error;

      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property(
          "message",
          "session create: internal server error"
        );

        done();
      });

      this.lock._session(this.ctx);
    });

    it("should start session renew", function (done) {
      this.nock
        .put("/v1/session/create")
        .reply(200, { ID: "123" })
        .put("/v1/session/renew/123")
        .reply(200, {})
        .put("/v1/session/renew/123")
        .reply(500);

      let error;

      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property("message", "internal server error");

        done();
      });

      this.lock._session(this.ctx);
    });
  });

  describe("_acquire", function () {
    it("should create key if it does not exist", function (done) {
      this.nock
        .put("/v1/kv/test?flags=" + FLAGS_IN + "&acquire=session123")
        .reply(503);

      let error = [];
      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property("message", "service unavailable");

        done();
      });

      this.lock._acquire(this.ctx);
    });
  });

  describe("_wait", function () {
    it("should end when get fails", function (done) {
      this.nock.get("/v1/kv/test?index=0&wait=15s").reply(500);

      let error = [];
      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property(
          "message",
          "consul: kv.get: internal server error"
        );

        done();
      });

      this.lock._wait(this.ctx);
    });

    it("should end when flags is invalid", function (done) {
      this.nock
        .get("/v1/kv/test?index=0&wait=15s")
        .reply(200, [{ Flags: 123 }], { "X-Consul-Index": "5" });

      let error;
      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property(
          "message",
          "consul: lock: existing key does not match lock use"
        );

        done();
      });

      this.lock._wait(this.ctx);
    });

    it("should end for non-empty/non-404 response", function (done) {
      this.nock.get("/v1/kv/test?index=0&wait=15s").reply(200);

      let error;
      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property(
          "message",
          "consul: lock: error getting key"
        );

        done();
      });

      this.lock._wait(this.ctx);
    });

    it("should acquire on success", function (done) {
      this.nock.get("/v1/kv/test?index=0&wait=15s").reply(404);

      this.lock._run = (ctx) => {
        should(ctx).have.property("state", "acquire");
        done();
      };

      this.lock._wait(this.ctx);
    });
  });

  describe("_monitor", function () {
    beforeEach(function () {
      this.ctx.key = "test";
      this.ctx.lockWaitTime = "5ms";
      this.ctx.lockWaitTimeout = 10;
      this.ctx.session = { id: "123", ttl: "5ms" };
    });

    it("should end when session changes", function (done) {
      this.nock
        .get("/v1/kv/test?index=0&wait=5ms")
        .reply(200, [], { "X-Consul-Index": "5" })
        .get("/v1/kv/test?index=5&wait=5ms")
        .reply(200, [{ Session: "123" }], { "X-Consul-Index": "7" })
        .get("/v1/kv/test?index=7&wait=5ms")
        .reply(200, [{ Session: "abc" }], { "X-Consul-Index": "10" });

      this.ctx.session.ttl = "15s";

      this.lock.on("end", () => {
        done();
      });
      this.lock._monitor(this.ctx);
    });

    it("should timeout when session ttl set", function (done) {
      this.nock
        .get("/v1/kv/test?index=0&wait=5ms")
        .reply(200, [], { "X-Consul-Index": "5" })
        .get("/v1/kv/test?index=5&wait=5ms")
        .reply(500)
        .get("/v1/kv/test?index=5&wait=5ms")
        .reply(200, [], { "X-Consul-Index": "10" })
        .get("/v1/kv/test?index=10&wait=5ms")
        .delay(1000)
        .reply(200, [], { "X-Consul-Index": "15" });

      this.ctx.session = { ttl: "10ms" };

      this.sinon.stub(consul.Watch.prototype, "_wait").callsFake(() => {
        return 0;
      });

      let monitor;

      this.lock.on("end", () => {
        should(monitor._options).have.property("index", "10");

        done();
      });

      this.lock._monitor(this.ctx);

      monitor = this.ctx.monitor;
    });
  });

  describe("_end", function () {
    it("should only run once", function () {
      should(this.ctx).have.property("end", false);
      this.lock._end(this.ctx);
      should(this.ctx).have.property("end", true);
      this.lock._end(this.ctx);
      should(this.ctx).have.property("end", true);
    });
  });

  describe("_release", function () {
    it("should end on set failure", function (done) {
      this.nock
        .put("/v1/kv/test?flags=3304740253564472344&release=session123")
        .reply(500);

      this.ctx.held = true;

      let error;
      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property("message", "internal server error");

        done();
      });

      this.lock._release(this.ctx);
    });

    it("should end when set returns false", function (done) {
      this.nock
        .put("/v1/kv/test?flags=3304740253564472344&release=session123")
        .reply(200);

      this.ctx.held = true;

      let error;
      this.lock.once("error", (err) => {
        error = err;
      });

      this.lock.on("end", () => {
        should(error).have.property("message", "failed to release lock");

        done();
      });

      this.lock._release(this.ctx);
    });

    it("should not set release when not held", function (done) {
      this.lock.on("end", () => {
        done();
      });
      this.lock._release(this.ctx);
    });
  });

  describe("integration", function () {
    it("should acquire and release lock", function (done) {
      this.nock
        .put("/v1/session/create", {
          Name: "Consul API Lock",
          TTL: "15s",
          Node: "node1",
        })
        .matchHeader("x-consul-token", "123")
        .reply(200, { ID: "session123" })
        .get("/v1/kv/test?index=0&wait=5ms")
        .matchHeader("x-consul-token", "123")
        .reply(200, [{ Flags: FLAGS_OUT, Session: "abc" }], {
          "X-Consul-Index": "5",
        })
        .get("/v1/kv/test?index=5&wait=5ms")
        .matchHeader("x-consul-token", "123")
        .reply(200, [{ Flags: FLAGS_OUT, Session: "abc" }], {})
        .get("/v1/kv/test?index=5&wait=5ms")
        .matchHeader("x-consul-token", "123")
        .reply(200, [{ Flags: FLAGS_OUT }], { "X-Consul-Index": "10" })
        .put("/v1/kv/test?flags=" + FLAGS_IN + "&acquire=session123")
        .matchHeader("x-consul-token", "123")
        .reply(200, false)
        .get("/v1/kv/test?index=10&wait=5ms")
        .matchHeader("x-consul-token", "123")
        .reply(200, [{ Flags: FLAGS_OUT }], { "X-Consul-Index": "15" })
        .put("/v1/kv/test?flags=" + FLAGS_IN + "&acquire=session123")
        .matchHeader("x-consul-token", "123")
        .reply(200, true)
        .get("/v1/kv/test?index=15&wait=5ms")
        .matchHeader("x-consul-token", "123")
        .reply(200, [{ Flags: FLAGS_OUT }])
        .put("/v1/kv/test?flags=" + FLAGS_IN + "&release=session123")
        .matchHeader("x-consul-token", "123")
        .reply(200, true);

      const lock = this.consul.lock({
        key: "test",
        lockWaitTime: "5ms",
        lockRetryTime: "1ms",
        session: { node: "node1" },
        token: "123",
      });

      let acquire = 0;
      let release = 0;

      lock.on("acquire", () => {
        acquire++;
        lock.release();
      });
      lock.on("release", () => {
        release++;
      });

      lock.on("end", () => {
        should(acquire).equal(1);
        should(release).equal(1);

        done();
      });

      lock.acquire();
    });

    it("should use provided string session", function (done) {
      this.nock
        .get("/v1/kv/test?index=0&wait=5ms")
        .reply(200, [{ Flags: FLAGS_OUT }], { "X-Consul-Index": "5" })
        .put("/v1/kv/test?flags=" + FLAGS_IN + "&acquire=session123")
        .reply(200, true)
        .get("/v1/kv/test?index=5&wait=5ms")
        .reply(200, [{ Flags: FLAGS_OUT }])
        .put("/v1/kv/test?flags=" + FLAGS_IN + "&release=session123")
        .reply(200, true);

      const lock = this.consul.lock({
        key: "test",
        lockWaitTime: "5ms",
        lockRetryTime: "1ms",
        session: "session123",
      });

      let acquire = 0;
      let release = 0;

      lock.on("acquire", () => {
        acquire++;
        lock.release();
      });
      lock.on("release", () => {
        release++;
      });

      lock.on("end", () => {
        should(acquire).equal(1);
        should(release).equal(1);

        done();
      });

      lock.acquire();
    });
  });
});
