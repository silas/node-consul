const errors = require("../errors");
const utils = require("../utils");

class CatalogService {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Lists services in a given DC
   */

  async list(opts) {
    if (typeof opts === "string") {
      opts = { dc: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.service.list",
      path: "/catalog/services",
      query: {},
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Lists the nodes in a given service
   */
  async nodes(opts) {
    if (typeof opts === "string") {
      opts = { service: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.service.nodes",
      path: "/catalog/service/{service}",
      params: { service: opts.service },
      query: {},
    };

    if (!opts.service) {
      throw this.consul._err(errors.Validation("service required"), req);
    }
    if (opts.tag) req.query.tag = opts.tag;

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.CatalogService = CatalogService;
