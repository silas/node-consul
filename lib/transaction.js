/**
 * Transaction
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('./errors');
var utils = require('./utils');

/**
 * Initialize a new `Transaction` client.
 */

function Transaction(consul) {
  this.consul = consul;
}

/**
 * Object meta
 */

Transaction.meta = {};

/**
 * Set
 */

Transaction.prototype.create = function(operations, callback) {
  var options;
  switch (arguments.length) {
    case 3:
      // create(operations, opts, callback)
      options = arguments[1];
      options.operations = arguments[0];
      callback = arguments[2];
      break;
    case 2:
      // create(operations, callback)
      options = {
        operations: arguments[0],
      };
      callback = arguments[1];
      break;
    default:
      return arguments[0](
        this.consul._err(errors.Validation('a list of operations are required as first arguments'),
      { name: 'Transaction.create' }));
  }

  options = utils.normalizeKeys(options);
  options = utils.defaults(options, this.consul._defaults);

  var req = {
    name: 'Transaction.create',
    path: '/txn',
    params: {},
    query: {},
    type: 'json',
    body: options.operations,
  };

  if (!(Array.isArray(options.operations) && options.operations.length > 0)) {
    return callback(
      this.consul._err(errors.Validation('operations must be an array with at least one item'),
    req));
  }

  utils.options(req, options);

  this.consul._put(req, utils.body, callback);
};

/**
 * Module exports.
 */

exports.Transaction = Transaction;
