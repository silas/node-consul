const errors = require("../errors");
const utils = require("../utils");

class CatalogConnect {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Lists the nodes in a given Connect-capable service
   */
  async nodes(opts) {
    if (typeof opts === "string") {
      opts = { service: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.connect.nodes",
      path: "/catalog/connect/{service}",
      params: { service: opts.service },
      query: {},
    };

    if (!opts.service) {
      throw this.consul._err(errors.Validation("service required"), req);
    }

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.CatalogConnect = CatalogConnect;
