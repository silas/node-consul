const errors = require("../errors");
const utils = require("../utils");

class AgentCheck {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Returns the checks the local agent is managing
   */
  async list(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.check.list",
      path: "/agent/checks",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Registers a new local check
   */
  async register(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.check.register",
      path: "/agent/check/register",
      type: "json",
    };

    try {
      req.body = utils.createCheck(opts);
    } catch (err) {
      throw this.consul._err(errors.Validation(err.message), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Deregister a local check
   */
  async deregister(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.check.deregister",
      path: "/agent/check/deregister/{id}",
      params: { id: opts.id },
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Mark a local test as passing
   */
  async pass(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.check.pass",
      path: "/agent/check/pass/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    if (opts.note) req.query.note = opts.note;

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Mark a local test as warning
   */
  async warn(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.check.warn",
      path: "/agent/check/warn/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    if (opts.note) req.query.note = opts.note;

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Mark a local test as critical
   */
  async fail(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "agent.check.fail",
      path: "/agent/check/fail/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    if (opts.note) req.query.note = opts.note;

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }
}

exports.AgentCheck = AgentCheck;
