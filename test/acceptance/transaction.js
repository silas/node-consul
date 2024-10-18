"use strict";

const should = require("should");

const helper = require("./helper");

helper.describe("Transaction", function () {
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

  describe("create", function () {
    it("should create two kv pairs", async function () {
      const key1 = "key1";
      const value1 = "value1";
      const key2 = "key2";
      const value2 = "value2";

      const response = await this.c1.transaction.create([
        {
          KV: {
            Verb: "set",
            Key: key1,
            Value: Buffer.from(value1).toString("base64"),
          },
        },
        {
          KV: {
            Verb: "set",
            Key: key2,
            Value: Buffer.from(value2).toString("base64"),
          },
        },
      ]);

      should(response).have.property("Results");
      should(response.Results).be.Array();

      const results = response.Results;
      should(results).have.length(2);
      should(results[0]).have.property("KV");
      should(results[1]).have.property("KV");
      should(results[0].KV).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "LockIndex",
        "Key",
        "Flags",
      );
      should(results[1].KV).have.keys(
        "CreateIndex",
        "ModifyIndex",
        "LockIndex",
        "Key",
        "Flags",
      );

      const data1 = await this.c1.kv.get(key1);
      should(data1).have.property("Value");
      should(data1.Value).eql(value1);

      const data2 = await this.c1.kv.get(key2);
      should(data2).have.property("Value");
      should(data2.Value).eql(value2);
    });
  });
});
