const errors = require("../errors");
const utils = require("../utils");

class AclToken {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Creates a new token with policy
   */
  async create(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.create",
      path: "/acl/token",
      query: {},
      type: "json",
      body: {},
    };

    if (opts.name) req.body.Name = opts.name;
    if (opts.secretid) req.body.SecretID = opts.secretid;
    if (opts.policies) req.body.Policies = opts.policies;
    if (opts.roles) req.body.Roles = opts.roles;

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }

  /**
   * Update the token
   */
  async update(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.update",
      path: "/acl/token/{id}",
      query: { },
      params: { id: opts.id },
      type: "json",
      body: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    if (opts.id) req.body.AccessorID = opts.id;
    if (opts.name) req.body.Name = opts.name;
    if (opts.policies) req.body.Policies = opts.policies;
    if (opts.roles) req.body.Roles = opts.roles;
    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Destroys a given token
   */
  async destroy(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.destroy",
      path: "/acl/token/{id}",
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
   * Token info
   */
  async info(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.info",
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
   * Creates a new token by cloning an existing token
   */
  async clone(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.clone",
      path: "/acl/token/{id}/clone",
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
   * Lists all the active tokens
   */
  async list(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.list",
      path: "/acl/tokens",
      query: {},
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.AclToken = AclToken;
