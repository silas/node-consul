const errors = require("../errors");
const utils = require("../utils");

class AclPolicy {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Creates a new policy
   */
  async create(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.policy.create",
      path: "/acl/policy",
      query: {},
      type: "json",
      body: {},
    };

    if (opts.name) req.body.Name = opts.name;
    if (opts.type) req.body.Type = opts.type;
    if (opts.rules) req.body.Rules = opts.rules;
    if (opts.datacenters) req.body.Datacenters = opts.datacenters;
    if (opts.namespace) req.body.Namespace = opts.namespace;

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }

  /**
   * Update the policy
   */
  async update(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.policy.update",
      path: "/acl/policy/{id}",
      query: {},
      params: { id: opts.id },
      type: "json",
      body: {},
    };
    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }


    if (opts.name) req.body.Name = opts.name;
    if (opts.type) req.body.Type = opts.type;
    if (opts.rules) req.body.Rules = opts.rules;
    if (opts.datacenters) req.body.Datacenters = opts.datacenters;
    if (opts.namespace) req.body.Namespace = opts.namespace;

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Destroys a given policy
   */
  async destroy(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.policy.destroy",
      path: "/acl/policy/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._delete(req, utils.empty);
  }

  /**
   * Policy info
   */
  async info(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.policy.info",
      path: "/acl/token/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.bodyItem);
  }

  get(...args) {
    return this.info(...args);
  }

  /**
   * Creates a new policy by cloning an existing policy
   */
  async clone(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.policy.clone",
      path: "/acl/policy/{id}/clone",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }

  /**
   * Lists all the active policies
   */
  async list(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.policy.list",
      path: "/acl/policies",
      query: {},
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.AclPolicy = AclPolicy;
