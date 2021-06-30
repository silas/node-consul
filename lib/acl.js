const AclLegacy = require("./acl/legacy").AclLegacy;
const utils = require("./utils");

class Acl {
  constructor(consul) {
    this.consul = consul;
    this.legacy = new Acl.Legacy(consul);
  }

  /**
   * Creates one-time management token if not configured
   */
  async bootstrap(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.bootstrap",
      path: "/acl/bootstrap",
      type: "json",
    };

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }

  /**
   * Check ACL replication
   */
  async replication(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "acl.replication",
      path: "/acl/replication",
      query: {},
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

Acl.Legacy = AclLegacy;

exports.Acl = Acl;
