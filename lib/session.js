const errors = require("./errors");
const utils = require("./utils");

class Session {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Creates a new session
   */
  async create(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "session.create",
      path: "/session/create",
      query: {},
      type: "json",
      body: {},
    };

    if (opts.lockdelay) req.body.LockDelay = opts.lockdelay;
    if (opts.name) req.body.Name = opts.name;
    if (opts.node) req.body.Node = opts.node;
    if (opts.checks) req.body.Checks = opts.checks;
    if (opts.behavior) req.body.Behavior = opts.behavior;
    if (opts.ttl) req.body.TTL = opts.ttl;

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }

  /**
   * Destroys a given session
   */
  async destroy(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "session.destroy",
      path: "/session/destroy/{id}",
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
   * Queries a given session
   */
  async info(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "session.info",
      path: "/session/info/{id}",
      params: { id: opts.id },
      query: {},
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.bodyItem);
  }

  get(opts) {
    return this.info(opts);
  }

  /**
   * Lists sessions belonging to a node
   */
  async node(opts) {
    if (typeof opts === "string") {
      opts = { node: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "session.node",
      path: "/session/node/{node}",
      params: { node: opts.node },
    };

    if (!opts.node) {
      throw this.consul._err(errors.Validation("node required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Lists all the active sessions
   */
  async list(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "session.list",
      path: "/session/list",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Renews a TTL-based session
   */
  async renew(opts) {
    if (typeof opts === "string") {
      opts = { id: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "session.renew",
      path: "/session/renew/{id}",
      params: { id: opts.id },
    };

    if (!opts.id) {
      throw this.consul._err(errors.Validation("id required"), req);
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }
}

exports.Session = Session;
