"use strict";

const async_ = require("async");
const should = require("should");
const uuid = require("node-uuid");

const constants = require("../../lib/constants");

const helper = require("./helper");

helper.describe("Agent", function () {
  before(async function () {
    await helper.before(this);
  });

  after(async function () {
    await helper.after(this);
  });

  describe("members", function () {
    it("should return members agent sees in cluster gossip pool", async function () {
      const data = await this.c1.agent.members();
      should(data).be.instanceOf(Array);

      should(data.length).eql(1);
      should(
        data.map(function (m) {
          return m.Name;
        })
      ).containEql("node1");
    });
  });

  describe("self", function () {
    it("should return information about agent", async function () {
      const data = await this.c1.agent.self();
      should(data).be.instanceOf(Object);
      should(data).have.properties("Config", "Member");

      should(data.Config.Server).be.true();
      should(data.Config.Datacenter).eql("dc1");
      should(data.Config.NodeName).eql("node1");

      should(data.Member.Name).eql("node1");
      should(data.Member.Addr).eql("127.0.0.1");
    });

    it("should work with opts", async function () {
      await this.c1.agent.self({});
    });
  });

  describe("maintenance", function () {
    it("should set node maintenance mode", async function () {
      const statusChecks = await this.c1.agent.checks();
      should(statusChecks).not.have.property("_node_maintenance");

      await this.c1.agent.maintenance(true);

      const enableStatus = await this.c1.agent.checks();
      should(enableStatus).have.property("_node_maintenance");
      should(enableStatus._node_maintenance).have.property(
        "Status",
        "critical"
      );

      await this.c1.agent.maintenance({ enable: false });

      const disableStatus = await this.c1.agent.checks();
      should(disableStatus).not.have.property("_node_maintenance");
    });

    it("should require valid enable", async function () {
      try {
        await this.c1.agent.maintenance({ enable: "false" });
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: agent.maintenance: enable required"
        );
      }
    });
  });

  describe("join", function () {
    it("should make node2 join cluster", async function () {
      const joinAddr = "127.0.0.1";
      const joinerAddr = "127.0.0.2";

      const members = await this.c1.agent.members();
      const memberAddrs = members.map(function (m) {
        return m.Addr;
      });

      should(memberAddrs).containEql(joinAddr);
      should(memberAddrs).not.containEql(joinerAddr);

      await this.c2.agent.join({ address: joinAddr, token: "agent_master" });
    });

    it("should require address", async function () {
      try {
        await this.c1.agent.join({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: agent.join: address required"
        );
      }
    });
  });

  describe("forceLeave", function () {
    it("should remove node2 from the cluster", async function () {
      const ensureJoined = await this.c1.agent.members();

      const node2 = ensureJoined.find((m) => m.Name === "node2");
      should.exist(node2);
      should(node2.Status).eql(constants.AGENT_STATUS.indexOf("alive"));

      await this.c1.agent.forceLeave("node2");

      await async_.retry({ times: 100, interval: 100 }, async () => {
        const forceLeaveMembers = await this.c1.agent.members();
        const node = forceLeaveMembers.find((m) => m.Name === "node2");
        const leaving =
          node && node.Status === constants.AGENT_STATUS.indexOf("leaving");
        if (!leaving) throw new Error("Not leaving");
      });
    });

    it("should require node", async function () {
      try {
        await this.c1.agent.forceLeave({});
        should.ok(false);
      } catch (err) {
        should(err).have.property(
          "message",
          "consul: agent.forceLeave: node required"
        );
      }
    });
  });

  describe("check", function () {
    before(function () {
      // helper function to check existence of check
      this.exists = async (id, exists) => {
        const checks = await this.c1.agent.checks();

        let s = should(checks);
        if (!exists) s = s.not;
        s.have.property(id);
      };

      this.state = async (id, state) => {
        const checks = await this.c1.agent.checks();
        should(checks).have.property(id);

        const check = checks[id];
        should(check.Status).eql(state);
      };
    });

    beforeEach(async function () {
      this.name = "check-" + uuid.v4();
      this.deregister = [this.name];

      const checks = await this.c1.agent.checks();

      await Promise.all(
        Object.keys(checks).map((id) => this.c1.agent.check.deregister(id))
      );

      await this.c1.agent.check.register({ name: this.name, ttl: "10s" });
    });

    afterEach(async function () {
      await Promise.all(
        this.deregister.map((id) => this.c1.agent.check.deregister(id))
      );
    });

    describe("list", function () {
      it("should return agent checks", async function () {
        const data = await this.c1.agent.checks(this.name);
        should.exist(data);
        should(data).have.property(this.name);
      });
    });

    describe("register", function () {
      it("should create check", async function () {
        const name = "check-" + uuid.v4();

        await this.exists(name, false);
        await this.deregister.push(name);
        await this.c1.agent.check.register({ name: name, ttl: "1s" });
        await this.exists(name, true);
      });
    });

    describe("deregister", function () {
      it("should remove check", async function () {
        await this.exists(this.name, true);
        await this.c1.agent.check.deregister(this.name);
        await this.exists(this.name, false);
      });
    });

    describe("pass", function () {
      it("should mark check as passing", async function () {
        await this.state(this.name, "critical");
        await this.c1.agent.check.pass(this.name);
        await this.state(this.name, "passing");
      });
    });

    describe("warn", function () {
      it("should mark check as warning", async function () {
        await this.state(this.name, "critical");
        await this.c1.agent.check.warn(this.name);
        await this.state(this.name, "warning");
      });
    });

    describe("fail", function () {
      it("should mark check as critical", async function () {
        await this.state(this.name, "critical");
        await this.c1.agent.check.fail(this.name);
        await this.state(this.name, "critical");
      });
    });
  });

  describe("service", function () {
    before(function () {
      // helper function to check existence of service
      this.exists = async (id, exists) => {
        const services = await this.c1.agent.services();

        let s = should(services);
        if (!exists) s = s.not;
        s.have.property(id);
      };
    });

    beforeEach(async function () {
      this.name = "service-" + uuid.v4();
      this.deregister = [this.name];

      // remove existing services
      const services = await this.c1.agent.services();

      const ids = Object.values(services)
        .filter((s) => s && s.ID !== "consul")
        .map((s) => s.ID);

      await Promise.all(ids.map((id) => this.c1.agent.service.deregister(id)));

      // add service
      await this.c1.agent.service.register(this.name);
    });

    afterEach(async function () {
      await Promise.all(
        this.deregister.map((id) => this.c1.agent.service.deregister(id))
      );
    });

    describe("list", function () {
      it("should return agent services", async function () {
        const data = await this.c1.agent.services();
        should.exist(data);
        should(data).have.property(this.name);
      });
    });

    describe("register", function () {
      it("should create service", async function () {
        const name = "service-" + uuid.v4();

        await this.exists(name, false);
        await this.c1.agent.service.register(name);
        await this.exists(name, true);
      });

      it("should create service with http check", async function () {
        const name = "service-" + uuid.v4();
        const notes = "simple http check";

        await this.exists(name, false);

        await this.c1.agent.service.register({
          name: name,
          check: {
            http: "http://127.0.0.1:8500",
            interval: "30s",
            notes: notes,
          },
        });

        const checks = await this.c1.agent.check.list();
        should(checks).not.be.empty();
        should(checks["service:" + name]).have.property("Notes", notes);
      });

      it("should create service with script check", async function () {
        const name = "service-" + uuid.v4();
        const notes = "simple script check";

        await this.exists(name, false);

        await this.c1.agent.service.register({
          name: name,
          check: {
            args: ["sh", "-c", "true"],
            interval: "30s",
            timeout: "1s",
            notes: notes,
          },
        });

        const checks = await this.c1.agent.check.list();
        should(checks).not.be.empty();
        should(checks["service:" + name]).have.property("Notes", notes);
      });
    });

    describe("deregister", function () {
      it("should remove service", async function () {
        await this.exists(this.name, true);
        await this.c1.agent.service.deregister(this.name);
        await this.exists(this.name, false);
      });
    });

    describe("maintenance", function () {
      it("should set service maintenance mode", async function () {
        const checkId = "_service_maintenance:" + this.name;

        const checks = await this.c1.agent.checks();
        should(checks).not.have.property(checkId);

        await this.c1.agent.service.maintenance({
          id: this.name,
          enable: true,
        });

        const enableStatus = await this.c1.agent.checks();
        should(enableStatus).have.property(checkId);
        should(enableStatus[checkId]).have.property("Status", "critical");

        await this.c1.agent.service.maintenance({
          id: this.name,
          enable: false,
        });

        const disableStatus = this.c1.agent.checks();
        should(disableStatus).not.have.property(checkId);
      });
    });
  });
});
