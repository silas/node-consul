exports.DEFAULT_OPTIONS = [
  "consistent",
  "dc",
  "partition",
  "stale",
  "timeout",
  "token",
  "wait",
  "wan",
];

exports.AGENT_STATUS = ["none", "alive", "leaving", "left", "failed"];

exports.CHECK_STATE = ["unknown", "passing", "warning", "critical"];

const du = (exports.DURATION_UNITS = { ns: 1 });
du.us = 1000 * du.ns;
du.ms = 1000 * du.us;
du.s = 1000 * du.ms;
du.m = 60 * du.s;
du.h = 60 * du.m;
