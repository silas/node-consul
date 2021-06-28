const errors = require("./errors");
const utils = require("./utils");

class Event {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Fires a new user event
   */
  async fire(opts) {
    let options;
    if (arguments.length === 2) {
      options = {
        name: arguments[0],
        payload: arguments[1],
      };
    } else if (typeof opts === "string") {
      options = { name: opts };
    } else {
      options = opts;
    }

    options = utils.normalizeKeys(options);
    options = utils.defaults(options, this.consul._defaults);

    const req = {
      name: "event.fire",
      path: "/event/fire/{name}",
      params: { name: options.name },
      query: {},
    };

    if (!options.name) {
      throw this.consul._err(errors.Validation("name required"), req);
    }

    let buffer;

    if (options.hasOwnProperty("payload")) {
      buffer = Buffer.isBuffer(options.payload);
      req.body = buffer ? options.payload : Buffer.from(options.payload);
    }
    if (options.node) req.query.node = options.node;
    if (options.service) req.query.service = options.service;
    if (options.tag) req.query.tag = options.tag;

    utils.options(req, options);

    return await this.consul._put(req, utils.body).then((data) => {
      if (data.hasOwnProperty("Payload")) {
        data.Payload = utils.decode(data.Payload, { buffer: buffer });
      }
      return data;
    });
  }

  /**
   * Lists the most recent events an agent has seen
   */
  async list(opts) {
    if (typeof opts === "string") {
      opts = { name: opts };
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "event.list",
      path: "/event/list",
      query: {},
    };

    if (opts.name) req.query.name = opts.name;

    utils.options(req, opts);

    return await this.consul._get(req, utils.body).then((data) => {
      data.forEach((item) => {
        if (item.hasOwnProperty("Payload")) {
          item.Payload = utils.decode(item.Payload, opts);
        }
      });
      return data;
    });
  }
}

exports.Event = Event;
