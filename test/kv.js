"use strict";

const should = require("should");

const helper = require("./helper");

describe("Kv", function () {
  helper.setup(this);

  describe("get", function () {
    it("should work", async function () {
      this.nock.get("/v1/kv/key1").reply(200, [{ ok: true }]);

      const data = await this.consul.kv.get({ key: "key1" });
      should(data).eql({ ok: true });
    });

    it("should return raw", async function () {
      this.nock.get("/v1/kv/key1?raw=true").reply(200, "value1");

      const data = await this.consul.kv.get({
        key: "key1",
        raw: true,
      });
      should(data).eql(Buffer.from("value1"));
    });

    it("should return handle not found", async function () {
      this.nock.get("/v1/kv/key1").reply(404, "value1");

      const data = await this.consul.kv.get("key1");
      should.not.exist(data);
    });

    it("should decode values", async function () {
      this.nock
        .get("/v1/kv/?recurse=true")
        .reply(200, [{ Value: "dmFsdWUx" }, { ok: true }]);

      const data = await this.consul.kv.get({ recurse: true });
      should(data).eql([{ Value: "value1" }, { ok: true }]);
    });

    it("should empty response", async function () {
      this.nock.get("/v1/kv/?recurse=true").reply(200, []);

      const data = await this.consul.kv.get({ recurse: true });
      should.not.exist(data);
    });

    it("should handle errors", async function () {
      this.nock.get("/v1/kv/key1").reply(500);

      try {
        await this.consul.kv.get("key1");
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: kv.get: internal server error",
        );
      }
    });
  });

  describe("keys", function () {
    it("should work", async function () {
      this.nock.get("/v1/kv/key1?keys=true&separator=%3A").reply(200, ["test"]);

      const data = await this.consul.kv.keys({ key: "key1", separator: ":" });
      should(data).eql(["test"]);
    });

    it("should work string argument", async function () {
      this.nock.get("/v1/kv/key1?keys=true").reply(200, ["test"]);

      const data = await this.consul.kv.keys("key1");
      should(data).eql(["test"]);
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/kv/?keys=true").reply(200, ["test"]);

      const data = await this.consul.kv.keys();
      should(data).eql(["test"]);
    });
  });

  describe("set", function () {
    it("should work", async function () {
      this.nock
        .put("/v1/kv/key1?cas=1&flags=2&acquire=session", "value1")
        .reply(200, { ok: true });

      const data = await this.consul.kv.set({
        key: "key1",
        value: "value1",
        cas: 1,
        flags: 2,
        acquire: "session",
      });
      should(data).eql({ ok: true });
    });

    it("should work with 4 arguments", async function () {
      this.nock.put("/v1/kv/key1?release=session", "").reply(200, { ok: true });

      const opts = { release: "session" };
      const data = await this.consul.kv.set("key1", null, opts);
      should(data).eql({ ok: true });
    });

    it("should work with 3 arguments", async function () {
      this.nock.put("/v1/kv/key1", "value1").reply(200, { ok: true });

      const data = await this.consul.kv.set("key1", "value1");
      should(data).eql({ ok: true });
    });

    it("should require key", async function () {
      try {
        await this.consul.kv.set({});
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "consul: kv.set: key required");
      }
    });

    it("should require value", async function () {
      try {
        await this.consul.kv.set({ key: "key1" });
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "consul: kv.set: value required");
      }
    });
  });

  describe("del", function () {
    it("should work", async function () {
      this.nock.delete("/v1/kv/key1?cas=1").reply(200, true);

      const result = await this.consul.kv.del({ key: "key1", cas: 1 });
      should(result).equal(true);
    });

    it("should work using delete alias", async function () {
      this.nock.delete("/v1/kv/key1?cas=1").reply(200, true);

      const result = await this.consul.kv.delete({ key: "key1", cas: 1 });
      should(result).equal(true);
    });

    it("should work with string", async function () {
      this.nock.delete("/v1/kv/key1").reply(200);

      await this.consul.kv.del("key1");
    });

    it("should work support recurse", async function () {
      this.nock.delete("/v1/kv/?recurse=true").reply(200);

      await this.consul.kv.del({ recurse: true });
    });
  });
});
