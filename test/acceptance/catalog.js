"use strict";

const async_ = require("async");
const should = require("should");
const uuid = require("node-uuid");

const helper = require("./helper");

helper.describe("Catalog", function () {
  before(async function () {
    await helper.before(this);

    this.service = {
      name: "service-" + uuid.v4(),
      tag: "tag-" + uuid.v4(),
    };

    await this.c1.agent.service.register({
      name: this.service.name,
      tags: [this.service.tag],
    });

    await async_.retry({ times: 100, interval: 100 }, async () => {
      const data = await this.c1.catalog.services();

      if (!data || !data.hasOwnProperty(this.service.name)) {
        throw new Error("Service not created: " + this.service.name);
      }
    });
  });

  after(async function () {
    await helper.after(this);
  });

  describe("datacenters", function () {
    it("should return all known datacenters", async function () {
      const data = await this.c1.catalog.datacenters();
      should(data).eql(["dc1"]);
    });
  });

  describe("node", function () {
    describe("list", function () {
      it("should return all nodes in the current dc", async function () {
        const data = await this.c1.catalog.node.list();
        should(data).match([{ Node: "node1", Address: "127.0.0.1" }]);
      });

      it("should return all nodes in specified dc", async function () {
        const data = await this.c1.catalog.nodes("dc1");
        should(data).match([{ Node: "node1", Address: "127.0.0.1" }]);
      });
    });

    describe("services", function () {
      it("should return all services for a given node", async function () {
        const data = await this.c1.catalog.node.services("node1");

        should.exist(data);
        should.exist(data.Services);
        should.exist(data.Services[this.service.name]);
        should(data.Services[this.service.name]).have.properties(
          "ID",
          "Service",
          "Tags"
        );
        should(data.Services[this.service.name].Service).eql(this.service.name);
        should(data.Services[this.service.name].Tags).eql([this.service.tag]);
      });
    });
  });

  describe("service", function () {
    describe("list", function () {
      it("should return all services in the current dc", async function () {
        const data = await this.c1.catalog.service.list();
        const services = { consul: [] };
        services[this.service.name] = [this.service.tag];
        should(data).eql(services);
      });
    });

    describe("nodes", function () {
      it("should return all nodes for a given service", async function () {
        const data = await this.c1.catalog.service.nodes(this.service.name);
        should(data).be.instanceof(Array);

        const nodes = data.map(function (n) {
          return n.Node;
        });
        should(nodes).eql(["node1"]);
      });
    });
  });
});
