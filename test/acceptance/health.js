"use strict";

const async_ = require("async");
const should = require("should");
const uuid = require("node-uuid");

const helper = require("./helper");

helper.describe("Health", function () {
  before(async function () {
    this.service = "service-" + uuid.v4();

    await helper.before(this);

    await this.c1.agent.service.register({
      name: this.service,
      check: { ttl: "60s" },
    });

    await async_.retry({ times: 100, interval: 100 }, async () => {
      let data = await this.c1.health.node("node1");
      if (data && Array.isArray(data)) {
        data = data.find((c) => c.ServiceName === this.service);
      }

      if (!data) throw new Error("Check not for service: " + this.service);
    });
  });

  after(async function () {
    await helper.after(this);
  });

  describe("node", function () {
    it("should return checks for given node", async function () {
      const data = await this.c1.health.node("node1");

      should(data).be.instanceof(Array);

      should.exist(data[0]);

      should(data[0]).have.properties("Node", "CheckID", "Status");

      should(data[0].Node).eql("node1");
      should(data[0].CheckID).eql("serfHealth");
      should(data[0].Status).eql("passing");
    });
  });

  describe("checks", function () {
    it("should return all checks for a given service", async function () {
      let data = await this.c1.health.checks(this.service);

      should(data).be.instanceof(Array);
      data = data.find((c) => c.ServiceName === this.service);

      should.exist(data);

      should(data).have.properties("Node", "CheckID");

      should(data.CheckID).eql("service:" + this.service);
    });
  });

  describe("service", function () {
    it("should return health information for given service", async function () {
      const data = await this.c1.health.service(this.service);

      should.exist(data);

      should(data).be.instanceof(Array);
      should.exist(data[0]);

      should(data[0]).have.properties("Node", "Service", "Checks");

      should(data[0].Node).match({
        Node: "node1",
        Address: "127.0.0.1",
      });

      should(data[0].Service).have.properties("ID", "Service", "Tags");

      should(data[0].Service.ID).equal(this.service);
      should(data[0].Service.Service).equal(this.service);

      const checks = data[0].Checks.map((c) => c.CheckID).sort();

      should(checks).eql(["serfHealth", "service:" + this.service]);
    });
  });

  describe("state", function () {
    it("should return checks with a given state", async function () {
      const data = await this.c1.health.state("critical");
      should(data).be.instanceof(Array);
      should.exist(data[0]);

      should(data[0]).have.property("ServiceName");
      should(data[0].ServiceName).eql(this.service);

      should(data.length).eql(1);
    });

    it("should return all checks", async function () {
      const data = await this.c1.health.state("any");
      should(data).be.instanceof(Array);
      should(data.length).eql(2);
    });
  });
});
