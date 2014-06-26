/**
 * Helper functions
 */

'use strict';

/**
 * Check if object is empty
 */

function isEmpty(obj) {
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) return false;
  }

  return true;
}

/**
 * Create a shallow copy of obj composed of the specified properties.
 */

function pick(obj) {
  var args = Array.prototype.slice.call(arguments);
  args.shift();

  var result = {};

  args.forEach(function(name) {
    if (obj.hasOwnProperty(name)) {
      result[name] = obj[name];
    }
  });

  return result;
}

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

exports.isEmpty = isEmpty;
exports.normalizeKeys = normalizeKeys;
exports.pick = pick;
