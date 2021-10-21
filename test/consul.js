"use strict";

const http = require("http");

const should = require("should");

const consul = require("../lib");

const helper = require("./helper");

describe("Consul", function () {
  helper.setup(this);

  it("should work", function () {
    should(helper.consul()).not.have.property("_defaults");

    should(helper.consul({ defaults: { foo: "bar" } })).not.have.property(
      "_defaults"
    );

    should(helper.consul({ defaults: { token: "123" } }))
      .have.property("_defaults")
      .eql({
        token: "123",
      });

    should(
      helper.consul({
        defaults: { token: "123", dc: "test", foo: "bar" },
      })
    )
      .have.property("_defaults")
      .eql({
        token: "123",
        dc: "test",
      });

    should(helper.consul()._opts.baseUrl).eql({
      protocol: "http:",
      port: "8500",
      hostname: "127.0.0.1",
      path: "/v1",
    });

    should(
      helper.consul({
        host: "127.0.0.2",
        port: "8501",
        secure: true,
      })._opts.baseUrl
    ).eql({
      protocol: "https:",
      port: "8501",
      hostname: "127.0.0.2",
      path: "/v1",
    });

    should(
      helper.consul({
        baseUrl: "https://user:pass@example.org:8502/proxy/v1",
      })._opts.baseUrl
    ).eql({
      protocol: "https:",
      auth: "user:pass",
      port: "8502",
      hostname: "example.org",
      path: "/proxy/v1",
    });

    should(() => {
      helper.consul({ baseUrl: {} });
    }).throwError(/baseUrl must be a string.*/);

    const agent = new http.Agent();
    should(
        helper.consul({
          agent
        })._opts.agent
    ).equal(agent);
  });

  it("should not mutate options", function () {
    const opts = { test: "opts" };
    const client = helper.consul(opts);

    should(client._opts).not.exactly(opts);
    should(client._opts).containEql({ test: "opts" });
    client._opts.test = "fail";

    should(opts).eql({ test: "opts" });
  });

  describe("destroy", function () {
    it("should work", function () {
      const client = helper.consul();
      should(client._opts.agent).not.be.null();

      client.destroy();
      delete client._opts.agent.destroy;
      client.destroy();
      delete client._opts.agent;
      client.destroy();
    });
  });

  describe("parseQueryMeta", function () {
    it("should work", function () {
      should(consul.parseQueryMeta()).eql({});
      should(consul.parseQueryMeta({})).eql({});
      should(consul.parseQueryMeta({ headers: {} })).eql({});
      should(
        consul.parseQueryMeta({
          headers: {
            "x-consul-index": "5",
            "x-consul-lastcontact": "100",
            "x-consul-knownleader": "true",
            "x-consul-translate-addresses": "true",
          },
        })
      ).eql({
        LastIndex: "5",
        LastContact: 100,
        KnownLeader: true,
        AddressTranslationEnabled: true,
      });
    });
  });
});
