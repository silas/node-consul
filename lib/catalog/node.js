const errors = require("../errors");
const utils = require("../utils");

class CatalogNode {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Lists nodes in a given DC
   */
  async list(opts) {
    if (typeof opts === "string") {
      opts = { dc: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.node.list",
      path: "/catalog/nodes",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Lists the services provided by a node
   */
  async services(opts) {
    if (typeof opts === "string") {
      opts = { node: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.node.services",
      path: "/catalog/node/{node}",
      params: { node: opts.node },
    };

    if (!opts.node) {
      throw this.consul._err(errors.Validation("node required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.CatalogNode = CatalogNode;
