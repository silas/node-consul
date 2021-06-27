const CatalogConnect = require("./catalog/connect").CatalogConnect;
const CatalogNode = require("./catalog/node").CatalogNode;
const CatalogService = require("./catalog/service").CatalogService;
const utils = require("./utils");

class Catalog {
  constructor(consul) {
    this.consul = consul;

    this.connect = new Catalog.Connect(consul);
    this.node = new Catalog.Node(consul);
    this.service = new Catalog.Service(consul);
  }

  /**
   * Lists known datacenters
   */
  async datacenters(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.datacenters",
      path: "/catalog/datacenters",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Lists nodes in a given DC
   */
  nodes(...args) {
    return this.node.list(...args);
  }

  /**
   * Lists services in a given DC
   */
  services(...args) {
    return this.service.list(...args);
  }
}

Catalog.Connect = CatalogConnect;
Catalog.Node = CatalogNode;
Catalog.Service = CatalogService;

exports.Catalog = Catalog;
