"use strict";

const should = require("should");

const helper = require("./helper");

describe("Health", function () {
  helper.setup(this);

  describe("node", function () {
    it("should work", async function () {
      this.nock.get("/v1/health/node/node1").reply(200, { ok: true });

      const data = await this.consul.health.node({ node: "node1" });
      should(data).eql({ ok: true });
    });

    it("should work with one argument", async function () {
      this.nock.get("/v1/health/node/node1").reply(200, { ok: true });

      const data = await this.consul.health.node("node1");
      should(data).eql({ ok: true });
    });

    it("should require node", async function () {
      try {
        await this.consul.health.node({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: health.node: node required",
        );
      }
    });
  });

  describe("checks", function () {
    it("should work", async function () {
      this.nock.get("/v1/health/checks/service1").reply(200, { ok: true });

      const data = await this.consul.health.checks({ service: "service1" });
      should(data).eql({ ok: true });
    });

    it("should work with one argument", async function () {
      this.nock.get("/v1/health/checks/service1").reply(200, { ok: true });

      const data = await this.consul.health.checks("service1");
      should(data).eql({ ok: true });
    });

    it("should require service", async function () {
      try {
        await this.consul.health.checks({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: health.checks: service required",
        );
      }
    });
  });

  describe("service", function () {
    it("should work", async function () {
      this.nock
        .get("/v1/health/service/service1?tag=tag1&passing=true")
        .reply(200, { ok: true });

      const data = await this.consul.health.service({
        service: "service1",
        tag: "tag1",
        passing: "true",
      });
      should(data).eql({ ok: true });
    });

    it("should work with one argument", async function () {
      this.nock.get("/v1/health/service/service1").reply(200, { ok: true });

      const data = await this.consul.health.service("service1");
      should(data).eql({ ok: true });
    });

    it("should require service", async function () {
      try {
        await this.consul.health.service({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: health.service: service required",
        );
      }
    });
  });

  describe("state", function () {
    it("should work", async function () {
      this.nock.get("/v1/health/state/any").reply(200, { ok: true });

      const data = await this.consul.health.state({ state: "any" });
      should(data).eql({ ok: true });
    });

    it("should work with one argument", async function () {
      this.nock.get("/v1/health/state/warning").reply(200, { ok: true });

      const data = await this.consul.health.state("warning");
      should(data).eql({ ok: true });
    });

    it("should require state", async function () {
      try {
        await this.consul.health.state({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: health.state: state required",
        );
      }
    });

    it("should require valid state", async function () {
      try {
        await this.consul.health.state("foo");
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: health.state: state invalid: foo",
        );
      }
    });
  });
});
