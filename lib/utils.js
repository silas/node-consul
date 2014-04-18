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
 * Lowercase first character
 */

function toLower(value) {
  return value[0].toLowerCase() + value.slice(1);
}

/**
 * Module Exports.
 */

exports.isEmpty = isEmpty;
exports.pick = pick;
exports.toLower = toLower;
