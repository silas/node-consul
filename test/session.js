"use strict";

const should = require("should");

const helper = require("./helper");

describe("Session", function () {
  helper.setup(this);

  describe("create", function () {
    it("should work", async function () {
      this.nock
        .put("/v1/session/create", {
          LockDelay: "15s",
          Name: "name1",
          Node: "node1",
          Checks: ["a", "b"],
          Behavior: "release",
          TTL: "5s",
        })
        .reply(200, { ok: true });

      const data = await this.consul.session.create({
        lockdelay: "15s",
        name: "name1",
        node: "node1",
        checks: ["a", "b"],
        behavior: "release",
        ttl: "5s",
      });
      should(data).eql({ ok: true });
    });

    it("should work with no arguments", async function () {
      this.nock.put("/v1/session/create", {}).reply(200, { ok: true });

      const data = await this.consul.session.create();
      should(data).eql({ ok: true });
    });
  });

  describe("destroy", function () {
    it("should work", async function () {
      this.nock.put("/v1/session/destroy/123").reply(200);

      await this.consul.session.destroy({ id: "123" });
    });

    it("should work with string ID", async function () {
      this.nock.put("/v1/session/destroy/123").reply(200);

      await this.consul.session.destroy("123");
    });

    it("should require ID", async function () {
      try {
        await this.consul.session.destroy({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: session.destroy: id required",
        );
        should(err).have.property("isValidation", true);
      }
    });
  });

  describe("info", function () {
    it("should work", async function () {
      this.nock.get("/v1/session/info/123").reply(200, [{ ok: true }]);

      const data = await this.consul.session.info({ id: "123" });
      should(data).eql({ ok: true });
    });

    it("should work using get alias", async function () {
      this.nock.get("/v1/session/info/123").reply(200, [{ ok: true }]);

      const data = await this.consul.session.get({ id: "123" });
      should(data).eql({ ok: true });
    });

    it("should work with string ID", async function () {
      this.nock.get("/v1/session/info/123").reply(200, []);

      const data = await this.consul.session.info("123");
      should.not.exist(data);
    });

    it("should require ID", async function () {
      try {
        await this.consul.session.info({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: session.info: id required",
        );
        should(err).have.property("isValidation", true);
      }
    });
  });

  describe("node", function () {
    it("should work", async function () {
      this.nock.get("/v1/session/node/node1").reply(200, { ok: true });

      const data = await this.consul.session.node({ node: "node1" });
      should(data).eql({ ok: true });
    });

    it("should work with string ID", async function () {
      this.nock.get("/v1/session/node/node1").reply(200, { ok: true });

      const data = await this.consul.session.node("node1");
      should(data).eql({ ok: true });
    });

    it("should require node", async function () {
      try {
        await this.consul.session.node({});
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: session.node: node required",
        );
        should(err).have.property("isValidation", true);
      }
    });
  });

  describe("list", function () {
    it("should work", async function () {
      this.nock.get("/v1/session/list").reply(200, [{ ok: true }]);

      const data = await this.consul.session.list({});
      should(data).eql([{ ok: true }]);
    });

    it("should work with string ID", async function () {
      this.nock.get("/v1/session/list").reply(200, [{ ok: true }]);

      const data = await this.consul.session.list();
      should(data).eql([{ ok: true }]);
    });
  });

  describe("renew", function () {
    it("should work", async function () {
      this.nock.put("/v1/session/renew/123").reply(200, { ok: true });

      const data = await this.consul.session.renew({ id: "123" });
      should(data).eql({ ok: true });
    });

    it("should work with string", async function () {
      this.nock.put("/v1/session/renew/123").reply(200, { ok: true });

      const data = await this.consul.session.renew("123");
      should(data).eql({ ok: true });
    });

    it("should require ID", async function () {
      try {
        await this.consul.session.renew({});
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: session.renew: id required",
        );
        should(err).have.property("isValidation", true);
      }
    });
  });
});
