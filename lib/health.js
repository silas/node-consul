const constants = require("./constants");
const errors = require("./errors");
const utils = require("./utils");

class Health {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Returns the health info of a node
   */
  async node(opts) {
    if (typeof opts === "string") {
      opts = { node: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "health.node",
      path: "/health/node/{node}",
      params: { node: opts.node },
    };

    if (!opts.node) {
      throw this.consul._err(errors.Validation("node required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Returns the checks of a service
   */
  async checks(opts) {
    if (typeof opts === "string") {
      opts = { service: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "health.checks",
      path: "/health/checks/{service}",
      params: { service: opts.service },
    };

    if (!opts.service) {
      throw this.consul._err(errors.Validation("service required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Returns the nodes and health info of a service
   */
  async service(opts) {
    if (typeof opts === "string") {
      opts = { service: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "health.service",
      path: "/health/service/{service}",
      params: { service: opts.service },
      query: {},
    };

    if (!opts.service) {
      throw this.consul._err(errors.Validation("service required"), req);
    }

    if (opts.tag) req.query.tag = opts.tag;
    if (opts.passing) req.query.passing = "true";

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Returns the checks in a given state
   */
  async state(opts) {
    if (typeof opts === "string") {
      opts = { state: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "health.state",
      path: "/health/state/{state}",
      params: { state: opts.state },
    };

    if (!opts.state) {
      throw this.consul._err(errors.Validation("state required"), req);
    }

    if (opts.state !== "any" && constants.CHECK_STATE.indexOf(opts.state) < 0) {
      throw this.consul._err(
        errors.Validation("state invalid: " + opts.state),
        req
      );
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.Health = Health;
