/**
 * Helper functions
 */

'use strict';

/**
 * Normalize keys
 */

function normalizeKeys(obj) {
  var result = {};

  Object.keys(obj).forEach(function(name) {
    if (obj.hasOwnProperty(name)) {
      result[name.replace(/_/g, '').toLowerCase()] = obj[name];
    }
  });

  return result;
}

/**
 * Module Exports.
 */

exports.normalizeKeys = normalizeKeys;
