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
            should(err).have.property("message", "consul: acl.legacy.update: id required");
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
            should(err).have.property("message", "consul: acl.legacy.info: id required");
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
            should(err).have.property("message", "consul: acl.legacy.clone: id required");
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

    it("should work with no arguments", async function () {
      this.nock.put("/v1/acl/bootstrap").reply(200, { ok: true });

      const data = await this.consul.acl.bootstrap();
      should(data).eql({ ok: true });
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
});
