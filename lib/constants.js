/**
 * Constants
 */

'use strict';

/**
 * Default options
 */

exports.DEFAULT_OPTIONS = [
  'consistent',
  'dc',
  'stale',
  'timeout',
  'token',
  'wait',
  'wan',
];

/**
 * Values
 */

exports.AGENT_STATUS = [
  'none',
  'alive',
  'leaving',
  'left',
  'failed',
];

exports.CHECK_STATE = [
  'unknown',
  'passing',
  'warning',
  'critical',
];

/**
 * Time
 */

var du = exports.DURATION_UNITS = { ns: 1 };
du.us = 1000 * du.ns;
du.ms = 1000 * du.us;
du.s = 1000 * du.ms;
du.m = 60 * du.s;
du.h = 60 * du.m;
