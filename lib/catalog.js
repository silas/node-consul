const CatalogConnect = require("./catalog/connect").CatalogConnect;
const CatalogNode = require("./catalog/node").CatalogNode;
const CatalogService = require("./catalog/service").CatalogService;
const utils = require("./utils");
const errors = require("./errors");

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
   * Registers or updates entries in the catalog
   */
  async register(opts) {
    if (typeof opts === "string") {
      opts = { node: opts, address: "127.0.0.1" };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.register",
      path: "/catalog/register",
      type: "json",
      body: {},
    };

    if (!opts.node || !opts.address) {
      throw this.consul._err(
        errors.Validation("node and address required"),
        req,
      );
    }

    req.body = utils.createCatalogRegistration(opts);

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
  }

  /**
   * Deregister entries in the catalog
   */
  async deregister(opts) {
    if (typeof opts === "string") {
      opts = { node: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "catalog.deregister",
      path: "/catalog/deregister",
      type: "json",
      body: {},
    };

    if (!opts.node) {
      throw this.consul._err(errors.Validation("node required"), req);
    }

    req.body = utils.createCatalogDeregistration(opts);

    utils.options(req, opts);

    return await this.consul._put(req, utils.empty);
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
