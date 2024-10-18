"use strict";

const should = require("should");

const helper = require("./helper");

helper.describe("Kv", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  beforeEach(async function () {
    this.key = "hello";
    this.value = "world";

    await this.c1.kv.del({ recurse: true });

    const ok = await this.c1.kv.set(this.key, this.value);
    if (!ok) throw new Error("not setup");
  });

  describe("get", function () {
    it("should return one kv pair", async function () {
      const data = await this.c1.kv.get(this.key);

      should(data).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "LockIndex",
        "Key",
        "Flags",
        "Value",
      );
      should(data.Key).eql(this.key);
      should(data.Flags).eql(0);
      should(data.Value).eql(this.value);
    });

    it("should return raw value", async function () {
      const data = await this.c1.kv.get({ key: this.key, raw: true });
      should(Buffer.from(this.value)).eql(data);
    });

    it("should return no kv pair", async function () {
      const data = await this.c1.kv.get("none");
      should.not.exist(data);
    });

    it("should return list of kv pairs", async function () {
      const data = await this.c1.kv.get({ recurse: true });
      should(data).be.instanceof(Array);
      should(data.length).eql(1);

      const item = data[0];
      should(item).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "LockIndex",
        "Key",
        "Flags",
        "Value",
      );
      should(item.Key).eql(this.key);
      should(item.Flags).eql(0);
      should(item.Value).eql(this.value);
    });

    it("should wait for update", async function () {
      const update = "new-value";

      const get = await this.c1.kv.get(this.key);

      const waitingGet = this.c1.kv.get({
        key: this.key,
        index: get.ModifyIndex,
        wait: "3s",
      });

      await this.c1.kv.set(this.key, update);

      const data = await waitingGet;
      should(data.Value).eql(update);
    });
  });

  describe("keys", function () {
    beforeEach(async function () {
      this.keys = ["a/x/1", "a/y/2", "a/z/3"];

      await Promise.all(this.keys.map((key) => this.c1.kv.set(key, "value")));
    });

    it("should return keys", async function () {
      const data = await this.c1.kv.keys("a");
      should(data).be.instanceof(Array);

      should(data.length).equal(3);

      should(data).eql(
        this.keys.filter((key) => {
          return key.match(/^a/);
        }),
      );
    });

    it("should return keys with separator", async function () {
      const data = await this.c1.kv.keys({
        key: "a/",
        separator: "/",
      });
      should(data).be.instanceof(Array);

      should(data.length).equal(3);

      should(data).eql(
        this.keys
          .filter((key) => {
            return key.match(/^a\//);
          })
          .map(function (v) {
            return v.slice(0, 4);
          }),
      );
    });

    it("should return all keys", async function () {
      const data = await this.c1.kv.keys();
      should(data).be.instanceof(Array);

      should(data.length).equal(4);
    });
  });

  describe("set", function () {
    it("should create kv pair", async function () {
      const c = this.c1;
      const key = "one";
      const value = "two";

      const ok = await c.kv.set(key, value);
      should(ok).be.true();

      const data = await c.kv.get(key);
      should(data).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "LockIndex",
        "Key",
        "Flags",
        "Value",
      );
      should(data.Value).eql(value);
    });

    it("should create kv pair with null value", async function () {
      const c = this.c1;
      const key = "one";
      const value = null;

      const ok = await c.kv.set(key, value);
      should(ok).be.true();

      const data = await c.kv.get(key);
      should(data).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "LockIndex",
        "Key",
        "Flags",
        "Value",
      );
      should(data.Value).be.null();
    });
  });

  describe("del", function () {
    it("should delete kv pair", async function () {
      const del = await this.c1.kv.del(this.key);
      should(del).equal(true);

      const data = await this.c1.kv.get(this.key);
      should.not.exist(data);
    });
  });
});
