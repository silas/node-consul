/**
 * Errors
 */

'use strict';

/**
 * Create
 */

function create(message) {
  var error = message instanceof Error ?
    message :
    new Error(message ? message : undefined);

  error.isConsul = true;

  return error;
}

/**
 * Validation
 */

function validation(message) {
  var error = create(message);

  error.isValidation = true;

  return error;
}

/**
 * Module exports.
 */

exports.Consul = create;
exports.Validation = validation;
