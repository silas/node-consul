const AgentCheck = require("./agent/check").AgentCheck;
const AgentService = require("./agent/service").AgentService;
const errors = require("./errors");
const utils = require("./utils");

class Agent {
  constructor(consul) {
    this.consul = consul;
    this.check = new Agent.Check(consul);
    this.service = new Agent.Service(consul);
  }

  /**
   * Returns the checks the local agent is managing
   */
  checks() {
    return this.check.list.apply(this.check, arguments);
  }

  /**
   * Returns the services local agent is managing
   */
  services() {
    return this.service.list.apply(this.service, arguments);
  }

  /**
   * Returns the members as seen by the local consul agent
   */
  async members(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.members",
      path: "/agent/members",
      query: {},
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Reload agent configuration
   */
  async reload(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.reload",
      path: "/agent/reload",
    };

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Returns the local node configuration
   */
  async self(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.self",
      path: "/agent/self",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Manages node maintenance mode
   */
  async maintenance(opts) {
    if (typeof opts === "boolean") {
      opts = { enable: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.maintenance",
      path: "/agent/maintenance",
      query: { enable: opts.enable },
    };

    if (typeof opts.enable !== "boolean") {
      throw this.consul._err(errors.Validation("enable required"), req);
    }
    if (opts.reason) req.query.reason = opts.reason;

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Trigger local agent to join a node
   */
  async join(opts) {
    if (typeof opts === "string") {
      opts = { address: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.join",
      path: "/agent/join/{address}",
      params: { address: opts.address },
    };

    if (!opts.address) {
      throw this.consul._err(errors.Validation("address required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Force remove node
   */
  async forceLeave(opts) {
    if (typeof opts === "string") {
      opts = { node: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.forceLeave",
      path: "/agent/force-leave/{node}",
      params: { node: opts.node },
    };

    if (!opts.node) {
      throw this.consul._err(errors.Validation("node required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }
}

Agent.Check = AgentCheck;
Agent.Service = AgentService;

exports.Agent = Agent;
