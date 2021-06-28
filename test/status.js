"use strict";

const should = require("should");

const helper = require("./helper");

describe("Status", function () {
  helper.setup(this);

  describe("leader", function () {
    it("should work", async function () {
      this.nock.get("/v1/status/leader").reply(200, { ok: true });

      const data = await this.consul.status.leader({});
      should(data).eql({ ok: true });
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/status/leader").reply(200, { ok: true });

      const data = await this.consul.status.leader();
      should(data).eql({ ok: true });
    });
  });

  describe("peers", function () {
    it("should work", async function () {
      this.nock.get("/v1/status/peers").reply(200, [{ ok: true }]);

      const data = await this.consul.status.peers({});
      should(data).eql([{ ok: true }]);
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/status/peers").reply(200, [{ ok: true }]);

      const data = await this.consul.status.peers();
      should(data).eql([{ ok: true }]);
    });
  });
});
