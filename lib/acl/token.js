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

    if (opts.accessorid) req.body.AccessorID = opts.accessorid;
    if (opts.secretid) req.body.SecretID = opts.secretid;
    if (opts.description) req.body.Description = opts.description;
    if (opts.policies) req.body.Policies = opts.policies;
    if (opts.roles) req.body.Roles = opts.roles;
    if (opts.serviceidentities)
      req.body.ServiceIdentities = opts.serviceidentities;
    if (opts.nodeidentities) req.body.NodeIdentities = opts.nodeidentities;
    if (typeof opts.local === "boolean") req.body.Local = opts.local;
    if (opts.expirationtime) req.body.ExpirationTime = opts.expirationtime;
    if (opts.expirationttl) req.body.ExpirationTTL = opts.expirationttl;
    if (opts.namespace) req.body.Namespace = opts.namespace;

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
      query: {},
      params: { id: opts.accessorid || opts.id },
      type: "json",
      body: {},
    };

    if (!opts.id && !opts.accessorid) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    if (opts.secretid) req.body.SecretID = opts.secretid;
    if (opts.description) req.body.Description = opts.description;
    if (opts.policies) req.body.Policies = opts.policies;
    if (opts.roles) req.body.Roles = opts.roles;
    if (opts.serviceidentities)
      req.body.ServiceIdentities = opts.serviceidentities;
    if (opts.nodeidentities) req.body.NodeIdentities = opts.nodeidentities;
    if (typeof opts.local === "boolean") req.body.Local = opts.local;
    if (opts.expirationtime) req.body.ExpirationTime = opts.expirationtime;
    if (opts.expirationttl) req.body.ExpirationTTL = opts.expirationttl;
    if (opts.namespace) req.body.Namespace = opts.namespace;

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
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
      params: { id: opts.accessorid || opts.id },
      query: {},
    };

    if (!opts.id && !opts.accessorid) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._delete(req, utils.empty);
  }

  /**
   * Get specified token
   */
  async get(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.token.get",
      path: "/acl/token/{id}",
      params: { id: opts.accessorid || opts.id },
      query: {},
    };

    if (!opts.id && !opts.accessorid) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
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
      params: { id: opts.accessorid || opts.id },
      query: {},
    };

    if (!opts.id && !opts.accessorid) {
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
