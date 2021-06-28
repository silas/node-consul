"use strict";

const should = require("should");

const helper = require("./helper");

helper.describe("Status", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  describe("leader", function () {
    it("should return leader", async function () {
      const data = await this.c1.status.leader();
      should(data).eql("127.0.0.1:8300");
    });
  });

  describe("peers", function () {
    it("should return peers", async function () {
      const data = await this.c1.status.peers();
      should(data).eql(["127.0.0.1:8300"]);
    });
  });
});
