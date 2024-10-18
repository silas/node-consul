"use strict";

const should = require("should");

const helper = require("./helper");

describe("Event", function () {
  helper.setup(this);

  describe("fire", function () {
    it("should work", async function () {
      this.nock
        .put("/v1/event/fire/name?node=node1&service=service1&tag=tag1", "test")
        .reply(200, { ok: true, Payload: "dGVzdA==" });

      const data = await this.consul.event.fire({
        name: "name",
        payload: "test",
        node: "node1",
        service: "service1",
        tag: "tag1",
      });
      should(data).eql({ ok: true, Payload: "test" });
    });

    it("should work with two arguments", async function () {
      this.nock.put("/v1/event/fire/name", "test").reply(200, { ok: true });

      const data = await this.consul.event.fire("name", Buffer.from("test"));
      should(data).eql({ ok: true });
    });

    it("should work with one argument", async function () {
      this.nock.put("/v1/event/fire/name").reply(500);

      try {
        await this.consul.event.fire("name");
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "internal server error");
      }
    });

    it("should require name", async function () {
      try {
        await this.consul.event.fire({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: event.fire: name required",
        );
      }
    });
  });

  describe("list", function () {
    it("should work", async function () {
      this.nock
        .get("/v1/event/list?name=name1")
        .reply(200, [{ ok: true, Payload: "dGVzdA==" }, { ok: true }]);

      const data = await this.consul.event.list({ name: "name1" });
      should(data).eql([{ ok: true, Payload: "test" }, { ok: true }]);
    });

    it("should work with one argument", async function () {
      this.nock.get("/v1/event/list?name=name1").reply(200, []);

      await this.consul.event.list("name1");
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/event/list").reply(500);

      try {
        await this.consul.event.list();
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "internal server error");
      }
    });
  });
});
