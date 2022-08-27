const errors = require("../errors");
const utils = require("../utils");

class AclLegacy {
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
      name: "acl.legacy.create",
      path: "/acl/create",
      query: {},
      type: "json",
      body: {},
    };

    if (opts.name) req.body.Name = opts.name;
    if (opts.type) req.body.Type = opts.type;
    if (opts.rules) req.body.Rules = opts.rules;

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }

  /**
   * Update the policy of a token
   */
  async update(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.legacy.update",
      path: "/acl/update",
      query: {},
      type: "json",
      body: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    req.body.ID = opts.id;

    if (opts.name) req.body.Name = opts.name;
    if (opts.type) req.body.Type = opts.type;
    if (opts.rules) req.body.Rules = opts.rules;

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
      name: "acl.legacy.destroy",
      path: "/acl/destroy/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Queries the policy of a given token
   */
  async info(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.legacy.info",
      path: "/acl/info/{id}",
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
      name: "acl.legacy.clone",
      path: "/acl/clone/{id}",
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
      name: "acl.legacy.list",
      path: "/acl/list",
      query: {},
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.AclLegacy = AclLegacy;
