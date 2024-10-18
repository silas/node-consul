"use strict";

const should = require("should");

const helper = require("./helper");

describe("Query", function () {
  helper.setup(this);

  describe("list", function () {
    it("should work", async function () {
      this.nock
        .get("/v1/query")
        .reply(200, { ok: true }, { "x-consul-token": "token1" });

      const data = await this.consul.query.list({ token: "token1" });
      should(data).eql({ ok: true });
    });

    it("should work with no options", async function () {
      this.nock.get("/v1/query").reply(200, { ok: true });

      const data = await this.consul.query.list();
      should(data).eql({ ok: true });
    });
  });

  describe("create", function () {
    it("should work", async function () {
      this.nock
        .post("/v1/query", {
          Name: "name1",
          Session: "session1",
          Token: "token1",
          Near: "near1",
          Template: {
            Type: "type1",
            Regexp: "regexp1",
          },
          Service: {
            Service: "service1",
            Failover: {
              NearestN: 2,
              Datacenters: ["dc1"],
            },
            OnlyPassing: true,
            Tags: ["tag1"],
          },
          DNS: {
            TTL: "9s",
          },
        })
        .reply(200, { ok: true });

      const data = await this.consul.query.create({
        name: "name1",
        session: "session1",
        token: "token1",
        near: "near1",
        template: {
          type: "type1",
          regexp: "regexp1",
        },
        service: {
          service: "service1",
          failover: {
            nearestn: 2,
            datacenters: ["dc1"],
          },
          onlypassing: true,
          tags: ["tag1"],
        },
        dns: {
          ttl: "9s",
        },
      });
      should(data).eql({ ok: true });
    });

    it("should work with just service", async function () {
      this.nock
        .post("/v1/query", {
          Service: {
            Service: "service1",
          },
        })
        .reply(200, { ok: true });

      const data = await this.consul.query.create("service1");
      should(data).eql({ ok: true });
    });

    it("should require service", async function () {
      try {
        await this.consul.query.create({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.create: service required",
        );
      }
    });
  });

  describe("get", function () {
    it("should work", async function () {
      this.nock.get("/v1/query/query1").reply(200, [{ ok: true }]);

      const data = await this.consul.query.get("query1");
      should(data).eql({ ok: true });
    });

    it("should require query", async function () {
      try {
        await this.consul.query.get({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.get: query required",
        );
      }
    });
  });

  describe("update", function () {
    it("should work", async function () {
      this.nock
        .put("/v1/query/query1", {
          Name: "name1",
          Session: "session1",
          Token: "token1",
          Near: "near1",
          Template: {
            Type: "type1",
            Regexp: "regexp1",
          },
          Service: {
            Service: "service1",
            Failover: {
              NearestN: 2,
              Datacenters: ["dc1"],
            },
            OnlyPassing: true,
            Tags: ["tag1"],
          },
          DNS: {
            TTL: "9s",
          },
        })
        .reply(200);

      await this.consul.query.update({
        query: "query1",
        name: "name1",
        session: "session1",
        token: "token1",
        near: "near1",
        template: {
          type: "type1",
          regexp: "regexp1",
        },
        service: {
          service: "service1",
          failover: {
            nearestn: 2,
            datacenters: ["dc1"],
          },
          onlypassing: true,
          tags: ["tag1"],
        },
        dns: {
          ttl: "9s",
        },
      });
    });

    it("should require query", async function () {
      try {
        await this.consul.query.update();
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.update: query required",
        );
      }
    });

    it("should require service", async function () {
      try {
        await this.consul.query.update({ query: "query1", service: {} });
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.update: service required",
        );
      }
    });
  });

  describe("destroy", function () {
    it("should work", async function () {
      this.nock.delete("/v1/query/query1").reply(200, { ok: true });

      await this.consul.query.destroy("query1");
    });

    it("should require query", async function () {
      try {
        await this.consul.query.destroy({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.destroy: query required",
        );
      }
    });
  });

  describe("execute", function () {
    it("should work", async function () {
      this.nock.get("/v1/query/query1/execute").reply(200, { ok: true });

      await this.consul.query.execute("query1");
    });

    it("should require query", async function () {
      try {
        await this.consul.query.execute({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.execute: query required",
        );
      }
    });
  });

  describe("explain", function () {
    it("should work", async function () {
      this.nock.get("/v1/query/query1/explain").reply(200, { ok: true });

      await this.consul.query.explain("query1");
    });

    it("should require query", async function () {
      try {
        await this.consul.query.explain({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: query.explain: query required",
        );
      }
    });
  });

  describe("params", function () {
    it("should work", function () {
      let req = {};
      let opts = {
        name: "name1",
        session: "session1",
        token: "token1",
        near: "near1",
        template: {
          regexp: "regexp1",
        },
        service: {
          service: "service1",
          failover: {
            datacenters: ["dc1"],
          },
          onlypassing: true,
          tags: ["tag1"],
        },
        dns: {
          ttl: "9s",
        },
      };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Name: "name1",
          Session: "session1",
          Token: "token1",
          Near: "near1",
          Template: {
            Regexp: "regexp1",
          },
          Service: {
            Service: "service1",
            Failover: {
              Datacenters: ["dc1"],
            },
            OnlyPassing: true,
            Tags: ["tag1"],
          },
          DNS: {
            TTL: "9s",
          },
        },
      });

      req = {};
      opts = {
        template: { type: "type1" },
        service: {
          service: "service1",
          failover: { nearestn: 0 },
        },
      };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Template: { Type: "type1" },
          Service: {
            Service: "service1",
            Failover: { NearestN: 0 },
          },
        },
      });

      req = {};
      opts = {
        template: {},
        service: {
          failover: {},
        },
        dns: {},
      };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Service: {},
        },
      });
    });

    it("should handle token", function () {
      const req = {};
      const opts = { service: { service: "service1" }, token: "token1" };

      this.consul.query._params(req, opts);

      should(req).eql({
        body: {
          Token: "token1",
          Service: {
            Service: "service1",
          },
        },
      });
    });
  });
});
