"use strict";

const should = require("should");

const helper = require("./helper");

describe("Acl", function () {
  helper.setup(this);

  describe("bootstrap", function () {
    it("should work", async function () {
      this.nock.put("/v1/acl/bootstrap").reply(200, { ok: true });

      const data = await this.consul.acl.bootstrap({});
      should(data).eql({ ok: true });
    });

    it("should work with no arguments", async function () {
      this.nock.put("/v1/acl/bootstrap").reply(200, { ok: true });

      const data = await this.consul.acl.bootstrap();
      should(data).eql({ ok: true });
    });
  });

  describe("legacy", function () {
    describe("create", function () {
      it("should work", async function () {
        this.nock
          .put("/v1/acl/create", {
            Name: "name",
            Type: "type",
            Rules: "rules",
          })
          .reply(200, { ok: true });

        const data = await this.consul.acl.legacy.create({
          name: "name",
          type: "type",
          rules: "rules",
        });
        should(data).eql({ ok: true });
      });

      it("should work with no arguments", async function () {
        this.nock.put("/v1/acl/create", {}).reply(200, { ok: true });

        const data = await this.consul.acl.legacy.create();
        should(data).eql({ ok: true });
      });
    });

    describe("update", function () {
      it("should work", async function () {
        this.nock
          .put("/v1/acl/update", {
            ID: "123",
            Name: "name",
            Type: "type",
            Rules: "rules",
          })
          .reply(200);

        await this.consul.acl.legacy.update({
          id: "123",
          name: "name",
          type: "type",
          rules: "rules",
        });
      });

      it("should work with just ID", async function () {
        this.nock.put("/v1/acl/update", { ID: "123" }).reply(200);

        await this.consul.acl.legacy.update({ id: "123" });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.legacy.update({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.legacy.update: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("destroy", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/destroy/123").reply(200);

        await this.consul.acl.legacy.destroy({ id: "123" });
      });

      it("should work with string ID", async function () {
        this.nock.put("/v1/acl/destroy/123").reply(200);

        await this.consul.acl.legacy.destroy("123");
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.legacy.destroy({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.legacy.destroy: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("info", function () {
      it("should work", async function () {
        this.nock.get("/v1/acl/info/123").reply(200, [{ ok: true }]);

        const data = await this.consul.acl.legacy.info({ id: "123" });
        should(data).eql({ ok: true });
      });

      it("should work using get alias", async function () {
        this.nock.get("/v1/acl/info/123").reply(200, [{ ok: true }]);

        const data = await this.consul.acl.legacy.get({ id: "123" });
        should(data).eql({ ok: true });
      });

      it("should work with string ID", async function () {
        this.nock.get("/v1/acl/info/123").reply(200, [{ ok: true }]);

        const data = await this.consul.acl.legacy.info("123");
        should(data).eql({ ok: true });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.legacy.info({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.legacy.info: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("clone", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/clone/123").reply(200, { ID: "124" });

        const data = await this.consul.acl.legacy.clone({ id: "123" });
        should(data).eql({ ID: "124" });
      });

      it("should work with string ID", async function () {
        this.nock.put("/v1/acl/clone/123").reply(200, { ID: "124" });

        const data = await this.consul.acl.legacy.clone("123");
        should(data).eql({ ID: "124" });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.legacy.clone({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.legacy.clone: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("list", function () {
      it("should work", async function () {
        this.nock.get("/v1/acl/list").reply(200, [{ ok: true }]);

        const data = await this.consul.acl.legacy.list({});
        should(data).eql([{ ok: true }]);
      });

      it("should work with no arguments", async function () {
        this.nock.get("/v1/acl/list").reply(200, [{ ok: true }]);

        const data = await this.consul.acl.legacy.list();
        should(data).eql([{ ok: true }]);
      });
    });
  });

  describe("policy", function () {
    describe("create", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/policy").reply(200, { ok: true });

        const data = await this.consul.acl.policy.create({
          name: "test",
          description: "This is a test.",
          rules: "rules",
          datacenters: ["NYC"],
          namespace: "test",
        });
        should(data).eql({ ok: true });
      });

      it("should work with just name", async function () {
        this.nock.put("/v1/acl/policy").reply(200, { ok: true });

        const data = await this.consul.acl.policy.create({
          name: "test",
        });
        should(data).eql({ ok: true });
      });

      it("should require name", async function () {
        try {
          await this.consul.acl.policy.create({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.policy.create: name required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("update", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/policy/123").reply(200, { ok: true });

        const data = await this.consul.acl.policy.update({
          id: "123",
          name: "test",
          description: "This is a test.",
          rules: "rules",
          datacenters: ["NYC"],
          namespace: "test",
        });
        should(data).eql({ ok: true });
      });

      it("should work with just id", async function () {
        this.nock.put("/v1/acl/policy/123").reply(200, { ok: true });

        const data = await this.consul.acl.policy.update({
          id: "123",
        });
        should(data).eql({ ok: true });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.policy.update({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.policy.update: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("destroy", function () {
      it("should work", async function () {
        this.nock.delete("/v1/acl/policy/123").reply(200, { ok: true });

        await this.consul.acl.policy.destroy({ id: "123" });
      });

      it("should work with string ID", async function () {
        this.nock.delete("/v1/acl/policy/123").reply(200, { ok: true });

        await this.consul.acl.policy.destroy("123");
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.policy.destroy();
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.policy.destroy: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("get", function () {
      it("should work", async function () {
        this.nock.get("/v1/acl/policy/123").reply(200, { ok: true });

        const data = await this.consul.acl.policy.get({ id: "123" });
        should(data).eql({ ok: true });
      });

      it("should work with string ID", async function () {
        this.nock.get("/v1/acl/policy/123").reply(200, { ok: true });

        const data = await this.consul.acl.policy.get("123");
        should(data).eql({ ok: true });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.policy.get({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.policy.get: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("list", function () {
      it("should work", async function () {
        this.nock.get("/v1/acl/policies").reply(200, { ok: true });

        const data = await this.consul.acl.policy.list();
        should(data).eql({ ok: true });
      });
    });
  });

  describe("replication", function () {
    it("should work", async function () {
      this.nock.get("/v1/acl/replication?dc=dc1").reply(200, [{ ok: true }]);

      const data = await this.consul.acl.replication({ dc: "dc1" });
      should(data).eql([{ ok: true }]);
    });

    it("should work with no arguments", async function () {
      this.nock.get("/v1/acl/replication").reply(200, [{ ok: true }]);

      const data = await this.consul.acl.replication();
      should(data).eql([{ ok: true }]);
    });
  });

  describe("token", function () {
    describe("create", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/token").reply(200, { ok: true });

        const data = await this.consul.acl.token.create({
          name: "test",
          accessorid: "1",
          secretid: "2",
          description: "This is a test.",
          policies: [],
          roles: [],
          serviceidentities: [],
          nodeidentities: [],
          local: false,
          expirationtime: "2023-03-18T20:17:49Z",
          expirationttl: "60s",
          namespace: "test",
        });
        should(data).eql({ ok: true });
      });

      it("should work", async function () {
        this.nock.put("/v1/acl/token").reply(200, { ok: true });

        const data = await this.consul.acl.token.create({
          accessorid: "1",
          secretid: "2",
          description: "This is a test.",
          policies: [],
          roles: [],
          serviceidentities: [],
          nodeidentities: [],
          local: false,
          expirationtime: "2023-03-18T20:17:49Z",
          expirationttl: "60s",
          namespace: "test",
        });
        should(data).eql({ ok: true });
      });

      it("should work with no arguments", async function () {
        this.nock.put("/v1/acl/token").reply(200, { ok: true });

        const data = await this.consul.acl.token.create({});
        should(data).eql({ ok: true });
      });
    });

    describe("update", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/token/1").reply(200, { ok: true });

        const data = await this.consul.acl.token.update({
          id: "1",
          name: "test",
          secretid: "2",
          description: "This is a test.",
          policies: [],
          roles: [],
          serviceidentities: [],
          nodeidentities: [],
          local: false,
          expirationtime: "2023-03-18T20:17:49Z",
          expirationttl: "60s",
          namespace: "test",
        });
        should(data).eql({ ok: true });
      });

      it("should work with id only", async function () {
        this.nock.put("/v1/acl/token/2").reply(200, { ok: true });

        const data = await this.consul.acl.token.update({
          accessorid: "2",
        });
        should(data).eql({ ok: true });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.token.update({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.token.update: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("destroy", function () {
      it("should work", async function () {
        this.nock.delete("/v1/acl/token/123").reply(200, { ok: true });

        await this.consul.acl.token.destroy({ id: "123" });
      });

      it("should work with accessorid", async function () {
        this.nock.delete("/v1/acl/token/123").reply(200, { ok: true });

        await this.consul.acl.token.destroy({ accessorid: "123" });
      });

      it("should work with string ID", async function () {
        this.nock.delete("/v1/acl/token/123").reply(200, { ok: true });

        await this.consul.acl.token.destroy("123");
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.token.destroy();
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.token.destroy: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("clone", function () {
      it("should work", async function () {
        this.nock.put("/v1/acl/token/123/clone").reply(200, { ok: true });

        const data = await this.consul.acl.token.clone({ id: "123" });
        should(data).eql({ ok: true });
      });

      it("should work with accessorid", async function () {
        this.nock.put("/v1/acl/token/123/clone").reply(200, { ok: true });

        const data = await this.consul.acl.token.clone({ accessorid: "123" });
        should(data).eql({ ok: true });
      });

      it("should work with string ID", async function () {
        this.nock.put("/v1/acl/token/123/clone").reply(200, { ok: true });

        const data = await this.consul.acl.token.clone("123");
        should(data).eql({ ok: true });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.token.clone({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.token.clone: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("get", function () {
      it("should work", async function () {
        this.nock.get("/v1/acl/token/123").reply(200, { ok: true });

        const data = await this.consul.acl.token.get({ id: "123" });
        should(data).eql({ ok: true });
      });

      it("should work with accessorid", async function () {
        this.nock.get("/v1/acl/token/123").reply(200, { ok: true });

        const data = await this.consul.acl.token.get({ accessorid: "123" });
        should(data).eql({ ok: true });
      });

      it("should work with string ID", async function () {
        this.nock.get("/v1/acl/token/123").reply(200, { ok: true });

        const data = await this.consul.acl.token.get("123");
        should(data).eql({ ok: true });
      });

      it("should require ID", async function () {
        try {
          await this.consul.acl.token.get({});
          should.ok(false);
        } catch (err) {
          should(err).have.property(
            "message",
            "consul: acl.token.get: id required"
          );
          should(err).have.property("isValidation", true);
        }
      });
    });

    describe("list", function () {
      it("should work", async function () {
        this.nock.get("/v1/acl/tokens").reply(200, { ok: true });

        const data = await this.consul.acl.token.list();
        should(data).eql({ ok: true });
      });
    });
  });
});
