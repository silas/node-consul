"use strict";

const should = require("should");
const uuid = require("node-uuid");

const helper = require("./helper");

helper.describe("Event", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  beforeEach(async function () {
    this.name = "event-" + uuid.v4();
    this.payload = JSON.stringify({ hello: "world" });
    this.bufferPayload = Buffer.from(this.payload);

    this.event = await this.c1.event.fire(this.name, this.payload);
  });

  describe("fire", function () {
    it("should fire an event", async function () {
      const event = await this.c1.event.fire("test");
      should(event).have.keys(
        "ID",
        "Name",
        "Payload",
        "NodeFilter",
        "ServiceFilter",
        "TagFilter",
        "Version",
        "LTime"
      );
      should(event.Name).equal("test");
    });
  });

  describe("list", function () {
    it("should return events", async function () {
      const events = await this.c1.event.list();
      should(events).not.be.empty();
    });

    it("should return event with given name", async function () {
      const events = await this.c1.event.list(this.name);
      should(events).not.be.empty();
      should(events.length).equal(1);
      should(events[0].ID).equal(this.event.ID);
      should(events[0].Name).equal(this.name);
      should(events[0].Payload).equal(this.payload);
    });

    it("should return payload as buffer", async function () {
      const events = await this.c1.event.list({
        name: this.name,
        buffer: true,
      });
      should(events).not.be.empty();
      should(events[0].Payload).eql(this.bufferPayload);
    });
  });
});
