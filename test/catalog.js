"use strict";

const should = require("should");

const helper = require("./helper");

describe("Catalog", function () {
  helper.setup(this);

  describe("datacenters", function () {
    it("should work", async function () {
      this.nock.get("/v1/catalog/datacenters").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.datacenters({});
      should(data).eql([{ ok: true }]);
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/catalog/datacenters").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.datacenters();
      should(data).eql([{ ok: true }]);
    });
  });

  describe("nodes", function () {
    it("should work", async function () {
      this.nock.get("/v1/catalog/nodes").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.nodes({});
      should(data).eql([{ ok: true }]);
    });

    it("should work with just string", async function () {
      this.nock.get("/v1/catalog/nodes?dc=dc1").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.nodes("dc1");
      should(data).eql([{ ok: true }]);
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/catalog/nodes").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.nodes();
      should(data).eql([{ ok: true }]);
    });
  });

  describe("node", function () {
    describe("list", function () {
      it("should work", async function () {
        this.nock.get("/v1/catalog/nodes").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.node.list({});
        should(data).eql([{ ok: true }]);
      });

      it("should work with just string", async function () {
        this.nock.get("/v1/catalog/nodes?dc=dc1").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.node.list("dc1");
        should(data).eql([{ ok: true }]);
      });

      it("should work with no arguments", async function () {
        this.nock.get("/v1/catalog/nodes").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.node.list();
        should(data).eql([{ ok: true }]);
      });
    });

    describe("services", function () {
      it("should work", async function () {
        this.nock.get("/v1/catalog/node/node1").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.node.services({ node: "node1" });
        should(data).eql([{ ok: true }]);
      });

      it("should work with just string", async function () {
        this.nock.get("/v1/catalog/node/node1").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.node.services("node1");
        should(data).eql([{ ok: true }]);
      });

      it("should require node", async function () {
        try {
          await this.consul.catalog.node.services({});
          should.ok(false);
        } catch (err) {
          should(err).property(
            "message",
            "consul: catalog.node.services: node required"
          );
        }
      });
    });
  });

  describe("services", function () {
    it("should work", async function () {
      this.nock.get("/v1/catalog/services").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.services({});
      should(data).eql([{ ok: true }]);
    });

    it("should work with just string", async function () {
      this.nock.get("/v1/catalog/services?dc=dc1").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.services("dc1");
      should(data).eql([{ ok: true }]);
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/catalog/services").reply(200, [{ ok: true }]);

      const data = await this.consul.catalog.services();
      should(data).eql([{ ok: true }]);
    });
  });

  describe("services", function () {
    describe("list", function () {
      it("should work", async function () {
        this.nock.get("/v1/catalog/services").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.service.list({});
        should(data).eql([{ ok: true }]);
      });

      it("should work with just string", async function () {
        this.nock.get("/v1/catalog/services?dc=dc1").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.service.list("dc1");
        should(data).eql([{ ok: true }]);
      });

      it("should work with no arguments", async function () {
        this.nock.get("/v1/catalog/services").reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.service.list();
        should(data).eql([{ ok: true }]);
      });
    });

    describe("nodes", function () {
      it("should work", async function () {
        this.nock
          .get("/v1/catalog/service/service1?tag=web")
          .reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.service.nodes({
          service: "service1",
          tag: "web",
        });
        should(data).eql([{ ok: true }]);
      });

      it("should work with just string", async function () {
        this.nock
          .get("/v1/catalog/service/service1")
          .reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.service.nodes("service1");
        should(data).eql([{ ok: true }]);
      });

      it("should require service", async function () {
        try {
          await this.consul.catalog.service.nodes({});
          should.ok(false);
        } catch (err) {
          should(err).property(
            "message",
            "consul: catalog.service.nodes: service required"
          );
        }
      });
    });

    describe("connect nodes", function () {
      it("should work with just string", async function () {
        this.nock
          .get("/v1/catalog/connect/service1")
          .reply(200, [{ ok: true }]);

        const data = await this.consul.catalog.connect.nodes("service1");
        should(data).eql([{ ok: true }]);
      });

      it("should require service", async function () {
        try {
          await this.consul.catalog.connect.nodes({});
        } catch (err) {
          should(err).property(
            "message",
            "consul: catalog.connect.nodes: service required"
          );
        }
      });
    });
  });
});
