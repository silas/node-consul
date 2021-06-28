"use strict";

const should = require("should");

const helper = require("./helper");

helper.describe.skip("Acl", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  beforeEach(async function () {
    this.config = {
      name: "test",
      rules: JSON.stringify({
        key: {
          "": {
            policy: "read",
          },
          "rw/": {
            policy: "write",
          },
          "deny/": {
            policy: "deny",
          },
        },
      }),
    };

    const acl = await this.c1.acl.create({ token: "root", ...this.config });
    this.id = acl.ID;
  });

  afterEach(async function () {
    await this.c1.acl.destroy({ id: this.id, token: "root" });
  });

  describe("create", function () {
    it("should create token", async function () {
      const acl = await this.c1.acl.create({
        token: "root",
        type: "management",
      });
      should(acl).have.keys("ID");
    });

    it("should require token", async function () {
      try {
        await this.c1.acl.create({ token: "test" });
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "ACL not found");
      }
    });
  });

  describe("update", function () {
    it("should update existing token", async function () {
      const newName = "My New Name";

      await this.c1.acl.update({
        id: this.id,
        name: newName,
        type: "management",
        rules: this.config.rules,
        token: "root",
      });

      const acl = await this.c1.acl.get({ id: this.id });
      should(acl).have.keys("Name");
      should(acl.Name).equal(newName);
    });

    it("should require token", async function () {
      try {
        await this.c1.acl.destroy({ id: this.id, token: "" });
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "Permission denied");
      }
    });

    it("should require id", async function () {
      try {
        await this.c1.acl.update({});
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "consul: acl.update: id required");
      }
    });
  });

  describe("destroy", function () {
    it("should destroy token", async function () {
      await this.c1.acl.destroy({ id: this.id, token: "root" });

      const acl = await this.c1.acl.get({ id: this.id, token: "root" });
      should.not.exist(acl);
    });

    it("should require token", async function () {
      try {
        await this.c1.acl.destroy({ id: this.id, token: "" });
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "Permission denied");
      }
    });

    it("should require id", async function () {
      try {
        await this.c1.acl.destroy({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: acl.destroy: id required"
        );
      }
    });
  });

  describe("get", function () {
    it("should return token information", async function () {
      const acl = await this.c1.acl.get({ id: this.id, token: "root" });
      should(acl).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "ID",
        "Name",
        "Type",
        "Rules"
      );
      should(acl.Name).equal(this.config.name);
      should(acl.Type).equal("client");
      should(acl.Rules).equal(this.config.rules);
    });

    it("should require token", async function () {
      await this.c1.acl.get({ id: this.id, token: "" });
      // TODO: should this be denied?
      //should(err).have.property('message', 'Permission denied');
    });

    it("should require id", async function () {
      try {
        await this.c1.acl.info({});
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "consul: acl.info: id required");
      }
    });
  });

  describe("clone", function () {
    it("should copy existing token", async function () {
      const acl = await this.c1.acl.clone({ id: "root", token: "root" });
      should(acl).have.keys("ID");

      const acl2 = this.c1.acl.get({ id: acl.ID, token: acl.ID });
      should(acl2).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "ID",
        "Name",
        "Type",
        "Rules"
      );
      should(acl2.Name).equal("Master Token");
      should(acl2.Type).equal("management");
      should(acl2.Rules).equal("");
    });

    it("should require token", async function () {
      try {
        await this.c1.acl.clone({ id: this.id, token: "" });
      } catch (err) {
        should(err).have.property("message", "Permission denied");
      }
    });

    it("should require id", async function () {
      try {
        await this.c1.acl.clone({});
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "consul: acl.clone: id required");
      }
    });
  });

  describe("list", function () {
    it("should return all tokens", async function () {
      const acls = await this.c1.acl.list({ token: "root" });
      should(acls).be.an.instanceof(Array);
      should(acls.length).be.above(0);

      acls.forEach(function (acl) {
        should(acl).have.keys(
          "CreateIndex",
          "ModifyIndex",
          "ID",
          "Name",
          "Type",
          "Rules"
        );
      });
    });

    it("should require token", async function () {
      try {
        await this.c1.acl.list({ token: "" });
        should.ok(false);
      } catch (err) {
        should(err).have.property("message", "Permission denied");
      }
    });
  });
});
