"use strict";

const events = require("events");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const should = require("should");

const utils = require("../lib/utils");

const helper = require("./helper");

describe("utils", function () {
  helper.setup(this);

  describe("getAgent", function () {
    it("should work", function () {
      should(utils.getAgent()).be.undefined();
      should(utils.getAgent({})).be.undefined();

      should(utils.getAgent("http://www.example.com")).be.instanceOf(
        http.Agent
      );
      should(utils.getAgent(new URL("http://www.example.com"))).be.instanceOf(
        http.Agent
      );

      should(utils.getAgent("https://www.example.com")).be.instanceOf(
        https.Agent
      );
      should(utils.getAgent(new URL("https://www.example.com"))).be.instanceOf(
        https.Agent
      );
    });
  });

  describe("body", function () {
    it("should work", function () {
      utils.body({ err: null, res: { body: "body" } }, (...args) => {
        should(args).eql([false, undefined, "body"]);
      });

      utils.body({ err: "err", res: { body: "body" } }, (...args) => {
        should(args).eql([false, "err"]);
      });
    });
  });

  describe("bodyItem", function () {
    it("should work", function () {
      utils.bodyItem({ err: null, res: { body: ["body"] } }, (...args) => {
        should(args).eql([false, undefined, "body"]);
      });

      utils.bodyItem({ err: null, res: { body: [] } }, (...args) => {
        should(args).eql([false, undefined, undefined]);
      });

      utils.bodyItem({ err: "err", res: { body: ["body"] } }, (...args) => {
        should(args).eql([false, "err"]);
      });
    });
  });

  describe("empty", function () {
    it("should work", function () {
      utils.empty({ err: null, res: "res" }, (...args) => {
        should(args).eql([false, undefined, undefined]);
      });

      utils.empty({ err: "err", res: "res" }, (...args) => {
        should(args).eql([false, "err"]);
      });
    });
  });

  describe("normalizeKeys", function () {
    it("should work", function () {
      should(utils.normalizeKeys()).eql({});

      const Obj = function () {
        this.onetwo = "onetwo";
        this.TWO_ONE = "twoone";
        this.Value = "value";
      };
      Obj.prototype.fail = "yes";

      const obj = new Obj();

      should(utils.normalizeKeys(obj)).eql({
        onetwo: "onetwo",
        twoone: "twoone",
        value: "value",
      });
    });
  });

  describe("defaults", function () {
    it("should work", function () {
      should(utils.defaults()).eql({});
      should(utils.defaults({})).eql({});
      should(utils.defaults({}, {})).eql({});
      should(utils.defaults({}, { hello: "world" })).eql({ hello: "world" });
      should(utils.defaults({ hello: "world" }, {})).eql({ hello: "world" });
      should(utils.defaults({ hello: "world" }, { hello: "test" })).eql({
        hello: "world",
      });
      should(utils.defaults({ hello: null }, { hello: "test" })).eql({
        hello: null,
      });
      should(utils.defaults({ hello: undefined }, { hello: "test" })).eql({
        hello: undefined,
      });
      should(
        utils.defaults(
          { one: 1 },
          { two: 2, one: "nope" },
          { three: 3, two: "nope" },
          { three: "nope" }
        )
      ).eql({ one: 1, two: 2, three: 3 });
    });
  });

  describe("options", function () {
    const test = (opts, req) => {
      if (req === undefined) req = {};
      utils.options(req, opts);
      return req;
    };

    it("should work", function () {
      should(test()).eql({ headers: {}, query: {} });
      should(test({})).eql({ headers: {}, query: {} });
      should(test({ stale: true })).eql({ headers: {}, query: { stale: "1" } });
      should(
        test(
          {},
          {
            headers: { hello: "headers" },
            query: { hello: "query" },
          }
        )
      ).eql({
        headers: { hello: "headers" },
        query: { hello: "query" },
      });
      should(
        test({
          dc: "dc1",
          wan: true,
          consistent: true,
          index: 10,
          wait: "10s",
          token: "token1",
          near: "_agent",
          "node-meta": ["a:b", "c:d"],
          filter: "Meta.env == qa",
          ctx: "ctx",
          timeout: 20,
        })
      ).eql({
        headers: {
          "x-consul-token": "token1",
        },
        query: {
          dc: "dc1",
          wan: "1",
          consistent: "1",
          index: 10,
          wait: "10s",
          near: "_agent",
          "node-meta": ["a:b", "c:d"],
          filter: "Meta.env == qa",
        },
        ctx: "ctx",
        timeout: 20,
      });
      should(test({ timeout: "10s" })).eql({
        headers: {},
        query: {},
        timeout: 10000,
      });
    });

    describe("when token is undefined", function () {
      it("should not include x-consul-token header", function () {
        should(test({ token: undefined })).eql({
          headers: {},
          query: {},
        });
      });
    });

    describe("when token is null", function () {
      it("should not include x-consul-token header", function () {
        should(test({ token: null })).eql({
          headers: {},
          query: {},
        });
      });
    });

    describe("when token is empty string", function () {
      it("should not include x-consul-token header", function () {
        should(test({ token: "" })).eql({
          headers: {},
          query: {},
        });
      });
    });

    describe("when token is valid value", function () {
      it("should include x-consul-token header", function () {
        should(test({ token: "validToken" })).eql({
          headers: {
            "x-consul-token": "validToken",
          },
          query: {},
        });
      });
    });
  });

  describe("decode", function () {
    it("should work", function () {
      should(utils.decode(null)).equal(null);
      should(utils.decode()).equal(undefined);
      should(utils.decode("")).equal("");
      should(utils.decode("aGVsbG8gd29ybGQ=")).equal("hello world");
      should(utils.decode("aGVsbG8gd29ybGQ=", {})).equal("hello world");
      should(utils.decode("aGVsbG8gd29ybGQ=", { buffer: true })).eql(
        Buffer.from("hello world")
      );
    });
  });

  describe("clone", function () {
    it("should work", function () {
      let src = { hello: "world" };
      let dst = utils.clone(src);

      should(dst).eql({ hello: "world" });
      should(dst).not.equal(src);

      const Obj = function () {
        this.hello = "world";
      };
      Obj.prototype.fail = "yes";

      src = new Obj();
      dst = utils.clone(src);

      should(dst).eql({ hello: "world" });
      should(dst).not.equal(src);
    });
  });

  describe("parseDuration", function () {
    it("should work", function () {
      should(utils.parseDuration(0)).equal(0);
      should(utils.parseDuration(1000000)).equal(1);
      should(utils.parseDuration("0")).equal(0);
      should(utils.parseDuration("1000000")).equal(1);

      should(utils.parseDuration("1ns")).equal(1e-6);
      should(utils.parseDuration("1us")).equal(1e-3);
      should(utils.parseDuration("1ms")).equal(1);
      should(utils.parseDuration("1s")).equal(1e3);
      should(utils.parseDuration("1m")).equal(6e4);
      should(utils.parseDuration("1h")).equal(3.6e6);

      should(utils.parseDuration(".5s")).equal(500);
      should(utils.parseDuration("0.5s")).equal(500);
      should(utils.parseDuration("1.s")).equal(1000);
      should(utils.parseDuration("1.5s")).equal(1500);
      should(utils.parseDuration("10.03m")).equal(601800);

      should(utils.parseDuration()).be.undefined();
      should(utils.parseDuration("")).be.undefined();
      should(utils.parseDuration(".")).be.undefined();
      should(utils.parseDuration("10x")).be.undefined();
      should(utils.parseDuration(".ms")).be.undefined();
    });
  });

  describe("safeBigInt", function () {
    it("should work", function () {
      should(utils.safeBigInt(0)).equal(0n);
      should(utils.safeBigInt(-1)).equal(-1n);
      should(utils.safeBigInt(500)).equal(500n);
      should(utils.safeBigInt("0")).equal(0n);
      should(utils.safeBigInt("-1")).equal(-1n);
      should(utils.safeBigInt("500")).equal(500n);

      should(utils.safeBigInt("")).be.undefined();
      should(utils.safeBigInt("a")).be.undefined();
      should(utils.safeBigInt("1.0")).be.undefined();
      should(utils.safeBigInt(null)).be.undefined();
      should(utils.safeBigInt({})).be.undefined();
    });
  });

  describe("setTimeoutContext", function () {
    beforeEach(function () {
      this.ctx = new events.EventEmitter();
    });

    it("should cancel timeout", function (done) {
      utils.setTimeoutContext(
        () => {
          throw new Error("should have been canceled");
        },
        this.ctx,
        10
      );

      this.ctx.on("cancel", () => {
        should(this.ctx.listeners("cancel")).have.length(1);

        done();
      });

      this.ctx.emit("cancel");
    });

    it("should remove cancel listener", function (done) {
      utils.setTimeoutContext(
        () => {
          should(this.ctx.listeners("cancel")).have.length(0);

          done();
        },
        this.ctx,
        0
      );
    });
  });

  describe("createCheck", function () {
    it("should work", function () {
      should(
        utils.createCheck({
          ID: "id",
          name: "name",
          service_id: "service",
          http: "http://127.0.0.1:8000",
          timeout: "30s",
          interval: "60s",
          notes: "Just a note.",
          status: "passing",
          failuresbeforewarning: 1,
          failuresbeforecritical: 2,
          successBeforePassing: 3,
        })
      ).eql({
        ID: "id",
        Name: "name",
        ServiceID: "service",
        HTTP: "http://127.0.0.1:8000",
        Timeout: "30s",
        Interval: "60s",
        Notes: "Just a note.",
        Status: "passing",
        FailuresBeforeWarning: 1,
        FailuresBeforeCritical: 2,
        SuccessBeforePassing: 3,
      });

      should(
        utils.createCheck({
          ID: "id",
          name: "name",
          service_id: "service",
          tcp: "localhost:22",
          tcpusetls: true,
          interval: "10s",
          notes: "SSH TCP on port 22",
          status: "passing",
          deregistercriticalserviceafter: "1h",
        })
      ).eql({
        ID: "id",
        Name: "name",
        ServiceID: "service",
        TCP: "localhost:22",
        TCPUseTLS: true,
        Interval: "10s",
        Notes: "SSH TCP on port 22",
        Status: "passing",
        DeregisterCriticalServiceAfter: "1h",
      });
    });
  });

  describe("createServiceCheck", function () {
    it("should work", function () {
      should(
        utils.createServiceCheck({
          args: ["/usr/bin/true"],
          interval: "30s",
          timeout: "5s",
        })
      ).eql({
        Args: ["/usr/bin/true"],
        Interval: "30s",
        Timeout: "5s",
      });

      should(
        utils.createServiceCheck({
          script: "/usr/bin/true",
          interval: "30s",
          shell: "/bin/sh",
          dockercontainerid: "123",
        })
      ).eql({
        Script: "/usr/bin/true",
        Interval: "30s",
        Shell: "/bin/sh",
        DockerContainerID: "123",
      });

      should(
        utils.createServiceCheck({
          grpc: "localhost:50051",
          interval: "5s",
          tlsservername: "server",
          tlsskipverify: true,
          outputmaxsize: 4096,
        })
      ).eql({
        GRPC: "localhost:50051",
        Interval: "5s",
        TLSSkipVerify: true,
        TLSServerName: "server",
        OutputMaxSize: 4096,
      });

      should(
        utils.createServiceCheck({
          http: "https://example.com/test",
          body: "{}",
          disableredirects: true,
          header: { authorization: ["one"] },
          method: "POST",
          interval: "5s",
        })
      ).eql({
        HTTP: "https://example.com/test",
        Body: "{}",
        DisableRedirects: true,
        Header: { authorization: ["one"] },
        Method: "POST",
        Interval: "5s",
      });

      should(
        utils.createServiceCheck({
          h2ping: "https://example.com/test",
          interval: "5s",
        })
      ).eql({
        H2Ping: "https://example.com/test",
        Interval: "5s",
      });

      should(
        utils.createServiceCheck({
          h2ping: "http://example.com/test",
          h2pingusetls: false,
          interval: "5s",
        })
      ).eql({
        H2Ping: "http://example.com/test",
        Interval: "5s",
        H2PingUseTLS: false,
      });

      should(
        utils.createServiceCheck({
          grpc: "localhost:50051",
          grpcusetls: true,
          interval: "10s",
        })
      ).eql({
        GRPC: "localhost:50051",
        GRPCUseTLS: true,
        Interval: "10s",
      });

      should(
        utils.createServiceCheck({
          udp: "localhost:50051",
          interval: "10s",
        })
      ).eql({
        UDP: "localhost:50051",
        Interval: "10s",
      });

      should(
        utils.createServiceCheck({
          tcp: "localhost:50051",
          interval: "10s",
        })
      ).eql({
        TCP: "localhost:50051",
        Interval: "10s",
      });

      should(
        utils.createServiceCheck({
          tcp: "localhost:50051",
          interval: "10s",
          tcpusetls: true,
        })
      ).eql({
        TCP: "localhost:50051",
        Interval: "10s",
        TCPUseTLS: true,
      });

      should(
        utils.createServiceCheck({
          ttl: "15s",
        })
      ).eql({
        TTL: "15s",
      });

      should(
        utils.createServiceCheck({
          aliasnode: "web1",
        })
      ).eql({
        AliasNode: "web1",
      });

      should(
        utils.createServiceCheck({
          aliasservice: "web",
        })
      ).eql({
        AliasService: "web",
      });
    });

    it(
      "should require args, grpc, http, tcp and interval, ttl, or " +
        "aliasnode/aliasservice",
      () => {
        should(() => {
          utils.createCheck();
        }).throw(
          "args/grpc/h2ping/http/tcp/udp and interval, ttl, or aliasnode/aliasservice"
        );
      }
    );
  });

  describe("createCatalogDeregistration", function () {
    it("should work", function () {
      should(
        utils.createCatalogDeregistration({
          node: "node",
          checkid: "check",
          serviceid: "service",
        })
      ).eql({
        Node: "node",
        CheckID: "check",
        ServiceID: "service",
      });
    });
    it("should work", function () {
      should(utils.createCatalogDeregistration({})).eql({});
    });
  });

  describe("createCatalogRegistration", function () {
    it("throw on missing grpc/http/tcp", function () {
      should(() => {
        utils.createCatalogRegistration({
          id: "123",
          node: "node",
          nodeMeta: { "external-node": "true" },
          check: {
            node: "foo",
            checkID: "service:web1",
            serviceid: "service",
            name: "Web HTTP check",
            definition: {
              intervalduration: "5s",
            },
            notes: "http node check",
            status: "critical",
          },
          service: { id: "service" },
          address: "10.0.0.1",
          skipnodeupdate: true,
        });
      }).throw("at least one of http/tcp is required");
    });

    it("should work", function () {
      should(
        utils.createCatalogRegistration({
          id: "123",
          node: "node",
          nodeMeta: { "external-node": "true" },
          check: {
            node: "foo",
            checkID: "service:web1",
            serviceid: "service",
            name: "Web HTTP check",
            definition: {
              http: "http://example.org/",
              intervalduration: "5s",
            },
            notes: "http node check",
            status: "critical",
          },
          service: { id: "service" },
          address: "10.0.0.1",
          skipnodeupdate: true,
        })
      ).eql({
        ID: "123",
        Node: "node",
        NodeMeta: { "external-node": "true" },
        Check: {
          Node: "foo",
          CheckID: "service:web1",
          ServiceID: "service",
          Name: "Web HTTP check",
          Definition: {
            HTTP: "http://example.org/",
            IntervalDuration: "5s",
          },
          Notes: "http node check",
          Status: "critical",
        },
        Service: { ID: "service" },
        Address: "10.0.0.1",
        SkipNodeUpdate: true,
      });
    });

    it("should work", function () {
      should(
        utils.createCatalogRegistration({
          id: "123",
          node: "node",
          nodeMeta: { "node-meta": "true" },
          checks: [
            {
              name: "check2",
              definition: {
                http: "https://127.0.0.1:8000",
                tLsskipverify: true,
                tLsservername: "fqdn",
                intervalduration: "60s",
                deregistercriticalserviceafterduration: "120s",
              },
            },
            {
              name: "check3",
              definition: {
                tcp: "127.0.0.1:8000",
                intervalduration: "60s",
                timeoutduration: "10s",
              },
            },
            {},
          ],
          service: {
            id: "service",
            service: "service",
            tags: [],
            meta: { defaultContext: "/nodeapi" },
            address: "127.0.0.1",
            port: 1234,
          },
          address: "10.0.0.1",
        })
      ).eql({
        ID: "123",
        Node: "node",
        NodeMeta: { "node-meta": "true" },
        Checks: [
          {
            Name: "check2",
            Definition: {
              HTTP: "https://127.0.0.1:8000",
              TLSSkipVerify: true,
              TLSServerName: "fqdn",
              IntervalDuration: "60s",
              DeregisterCriticalServiceAfterDuration: "120s",
            },
          },
          {
            Name: "check3",
            Definition: {
              TCP: "127.0.0.1:8000",
              IntervalDuration: "60s",
              TimeoutDuration: "10s",
            },
          },
          {},
        ],
        Service: {
          Service: "service",
          ID: "service",
          Tags: [],
          Meta: { defaultContext: "/nodeapi" },
          Address: "127.0.0.1",
          Port: 1234,
        },
        Address: "10.0.0.1",
      });
    });
    should(
      utils.createCatalogRegistration({
        taggedaddresses: {},
      })
    ).eql({
      TaggedAddresses: {},
    });
  });

  describe("createCatalogService", function () {
    it("should work", function () {
      should(utils.createCatalogService({})).eql({});
    });
  });

  describe("createService", function () {
    it("should work", function () {
      should(
        utils.createService({
          id: "123",
          name: "service",
          tags: ["web"],
          Meta: { defaultContext: "/nodeapi" },
          check: {
            http: "http://example.org/",
            interval: "5s",
            notes: "http service check",
            status: "critical",
          },
          address: "10.0.0.1",
          port: 80,
        })
      ).eql({
        ID: "123",
        Name: "service",
        Tags: ["web"],
        Meta: { defaultContext: "/nodeapi" },
        Check: {
          HTTP: "http://example.org/",
          Interval: "5s",
          Notes: "http service check",
          Status: "critical",
        },
        Address: "10.0.0.1",
        Port: 80,
      });

      should(
        utils.createService({
          name: "service",
          check: {
            script: "true",
            interval: "5s",
          },
        })
      ).eql({
        Name: "service",
        Check: {
          Script: "true",
          Interval: "5s",
        },
      });

      should(
        utils.createService({
          id: "123",
          name: "service",
          check: {
            ttl: "10s",
            notes: "ttl service check",
          },
        })
      ).eql({
        ID: "123",
        Name: "service",
        Check: {
          TTL: "10s",
          Notes: "ttl service check",
        },
      });

      should(
        utils.createService({
          id: "123",
          name: "service",
          checks: [
            { ttl: "10s" },
            { http: "http://127.0.0.1:8000", interval: "60s" },
          ],
        })
      ).eql({
        ID: "123",
        Name: "service",
        Checks: [
          { TTL: "10s" },
          { HTTP: "http://127.0.0.1:8000", Interval: "60s" },
        ],
      });

      should(
        utils.createService({
          connect: {
            native: true,
          },
        })
      ).eql({
        Connect: {
          Native: true,
        },
      });

      should(
        utils.createService({
          connect: {
            sidecar_service: {
              check: {
                script: "true",
                interval: "5s",
              },
            },
          },
        })
      ).eql({
        Connect: {
          SidecarService: {
            Check: {
              Script: "true",
              Interval: "5s",
            },
          },
        },
      });

      should(
        utils.createService({
          connect: {
            sidecarservice: {
              proxy: {
                destinationservicename: "test",
              },
            },
          },
        })
      ).eql({
        Connect: {
          SidecarService: {
            Proxy: {
              DestinationServiceName: "test",
            },
          },
        },
      });

      should(
        utils.createService({
          connect: {
            proxy: {
              destinationservicename: "test",
              destinationserviceid: "123",
              LocalServiceAddress: "127.0.0.1",
              localserviceport: 8080,
              config: {},
              upstreams: [],
              meshgateway: {},
              expose: {},
            },
          },
        })
      ).eql({
        Connect: {
          Proxy: {
            DestinationServiceName: "test",
            DestinationServiceID: "123",
            LocalServiceAddress: "127.0.0.1",
            LocalServicePort: 8080,
            Config: {},
            Upstreams: [],
            MeshGateway: {},
            Expose: {},
          },
        },
      });

      should(
        utils.createService({
          taggedaddresses: {},
        })
      ).eql({
        TaggedAddresses: {},
      });

      should(
        utils.createService({
          taggedaddresses: {
            lan: {},
            wan: {},
          },
        })
      ).eql({
        TaggedAddresses: {
          lan: {},
          wan: {},
        },
      });

      should(
        utils.createService({
          taggedaddresses: {
            lan: {
              address: "127.0.0.1",
              port: 8080,
            },
            wan: {
              address: "10.0.0.1",
              port: 80,
            },
          },
        })
      ).eql({
        TaggedAddresses: {
          lan: {
            Address: "127.0.0.1",
            Port: 8080,
          },
          wan: {
            Address: "10.0.0.1",
            Port: 80,
          },
        },
      });
    });

    it("should not allow nested sidecars", function () {
      should(() => {
        utils.createService({
          connect: {
            sidecar_service: {
              connect: {
                SidecarService: {},
              },
            },
          },
        });
      }).throw("sidecarservice cannot be nested");
    });

    it("should require proxy destination service name", function () {
      should(() => {
        utils.createService({
          proxy: {},
        });
      }).throw("destinationservicename required");
    });
  });

  describe("hasIndexChanged", function () {
    it("should work", function () {
      should(utils.hasIndexChanged()).equal(false);
      should(utils.hasIndexChanged("")).equal(false);
      should(utils.hasIndexChanged(0n)).equal(false);
      should(utils.hasIndexChanged(1n)).equal(true);
      should(utils.hasIndexChanged(1n, "")).equal(true);
      should(utils.hasIndexChanged(10n, 1n)).equal(true);
      should(utils.hasIndexChanged(0n, 1n)).equal(false);
      should(utils.hasIndexChanged(1n, 1n)).equal(false);
      should(utils.hasIndexChanged(1n, 0n)).equal(true);
      should(utils.hasIndexChanged(2n, 1n)).equal(true);
      should(utils.hasIndexChanged(2n, 2n)).equal(false);
    });
  });
});
