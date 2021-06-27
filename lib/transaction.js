const errors = require("./errors");
const utils = require("./utils");

class Transaction {
  constructor(consul) {
    this.consul = consul;
  }

  /**
   * Create
   */
  async create(operations) {
    let opts;
    switch (arguments.length) {
      case 2:
        // create(operations, opts)
        opts = utils.clone(arguments[1]);
        opts.operations = operations;
        break;
      case 1:
        // create(operations)
        opts = { operations };
        break;
      default:
        throw this.consul._err(
          errors.Validation(
            "a list of operations are required as first arguments"
          ),
          { name: "Transaction.create" }
        );
    }

    opts = utils.normalizeKeys(opts);
    opts = utils.defaults(opts, this.consul._defaults);

    const req = {
      name: "Transaction.create",
      path: "/txn",
      params: {},
      query: {},
      type: "json",
      body: opts.operations,
    };

    if (!(Array.isArray(opts.operations) && opts.operations.length > 0)) {
      throw this.consul._err(
        errors.Validation("operations must be an array with at least one item"),
        req
      );
    }

    utils.options(req, opts);

    return await this.consul._put(req, utils.body);
  }
}

exports.Transaction = Transaction;
