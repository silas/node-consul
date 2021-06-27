const utils = require("./utils");

class Status {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Returns the current Raft leader.
   */
  async leader(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "status.leader",
      path: "/status/leader",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }

  /**
   * Returns the current Raft peer set
   */
  async peers(opts) {
    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "status.peers",
      path: "/status/peers",
    };

    utils.options(req, opts);

    return await this.consul._get(req, utils.body);
  }
}

exports.Status = Status;
