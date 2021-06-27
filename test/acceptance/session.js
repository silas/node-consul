"use strict";

const should = require("should");

const helper = require("./helper");

helper.describe("Session", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  beforeEach(async function () {
    const session = this.c1.session.create();
    this.id = session.ID;
  });

  afterEach(async function () {
    await this.c1.session.destroy(this.id);
  });

  describe("create", function () {
    it("should create session", async function () {
      const session = await this.c1.session.create();
      should(session).have.keys("ID");
    });
  });

  describe("destroy", function () {
    it("should destroy session", async function () {
      await this.c1.session.destroy(this.id);

      const session = await this.c1.session.get(this.id);
      should.not.exist(session);
    });
  });

  describe("get", function () {
    it("should return session information", async function () {
      const session = await this.c1.session.get(this.id);

      should(session).have.properties(
        "CreateIndex",
        "ID",
        "Name",
        "Node",
        "NodeChecks",
        "LockDelay",
        "Behavior",
        "TTL"
      );
    });
  });

  describe("node", function () {
    it("should return sessions for node", async function () {
      const sessions = await this.c1.session.node("node1");

      should(sessions).be.an.instanceof(Array);
      should(sessions.length).be.above(0);

      sessions.forEach((session) => {
        should(session).have.properties(
          "CreateIndex",
          "ID",
          "Name",
          "Node",
          "NodeChecks",
          "LockDelay",
          "Behavior",
          "TTL"
        );
      });
    });

    it("should return an empty list when no node found", async function () {
      const sessions = await this.c1.session.node("node");

      should(sessions).be.an.instanceof(Array);
      should(sessions.length).be.eql(0);
    });
  });

  describe("list", function () {
    it("should return all sessions", async function () {
      const sessions = await this.c1.session.list();

      should(sessions).be.an.instanceof(Array);
      should(sessions.length).be.above(0);

      sessions.forEach(function (session) {
        should(session).have.properties(
          "CreateIndex",
          "ID",
          "Name",
          "Node",
          "NodeChecks",
          "LockDelay",
          "Behavior",
          "TTL"
        );
      });
    });
  });

  describe("renew", function () {
    it("should renew session", async function () {
      const renew = await this.c1.session.renew(this.id);

      should(renew).be.an.Array();

      should(renew).not.be.empty();

      should(renew[0]).properties(
        "CreateIndex",
        "ID",
        "Name",
        "Node",
        "NodeChecks",
        "LockDelay",
        "Behavior",
        "TTL"
      );
    });
  });
});
