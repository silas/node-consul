const errors = require("../errors");
const utils = require("../utils");

class AgentService {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Returns the services local agent is managing
   */
  async list(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.service.list",
      path: "/agent/services",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Registers a new local service
   */
  async register(opts) {
    if (typeof opts === "string") {
      opts = { name: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.service.register",
      path: "/agent/service/register",
      type: "json",
      body: {},
    };

    if (!opts.name) {
      throw this.consul._err(errors.Validation("name required"), req);
    }

    try {
      req.body = utils.createService(opts);
    } catch (err) {
      throw this.consul._err(errors.Validation(err.message), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Deregister a local service
   */
  async deregister(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.service.deregister",
      path: "/agent/service/deregister/{id}",
      params: { id: opts.id },
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Manages node maintenance mode
   */
  async maintenance(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.service.maintenance",
      path: "/agent/service/maintenance/{id}",
      params: { id: opts.id },
      query: { enable: opts.enable },
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }
    if (typeof opts.enable !== "boolean") {
      throw this.consul._err(errors.Validation("enable required"), req);
    }
    if (opts.reason) req.query.reason = opts.reason;

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }
}

exports.AgentService = AgentService;
