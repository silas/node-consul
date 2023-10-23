const AclLegacy = require("./acl/legacy").AclLegacy;
const AclPolicy = require("./acl/policy").AclPolicy;
const AclToken = require("./acl/token").AclToken;
const utils = require("./utils");

class Acl {
  constructor(consul) {
    this.consul = consul;
    this.legacy = new Acl.Legacy(consul);
    this.policy = new Acl.Policy(consul);
    this.token = new Acl.Token(consul);
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
Acl.Policy = AclPolicy;
Acl.Token = AclToken;


exports.Acl = Acl;
