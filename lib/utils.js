"use strict";

const http = require("http");
const https = require("https");

const constants = require("./constants");

/**
 * Get HTTP agent
 */
function getAgent(baseUrl) {
  if (!baseUrl) return;

  let secure;
  if (typeof baseUrl === "string") {
    secure = !!baseUrl.match(/^https:/i);
  } else if (baseUrl.protocol) {
    secure = baseUrl.protocol === "https:";
  } else {
    return;
  }

  const Agent = secure ? https.Agent : http.Agent;
  return new Agent({ keepAlive: true });
}

/**
 * Inject response result
 */
function responseResult(request, ...args) {
  if (request.ctx && request.ctx.includeResponse) {
    return [request.res, ...args];
  } else {
    return args[0];
  }
}

/**
 * Inject response into error
 */
function applyErrorResponse(request) {
  if (request.err && request.ctx && request.ctx.includeResponse) {
    request.err.response = request.res;
  }
}

/**
 * Body
 */
function body(request, next) {
  if (request.err) {
    applyErrorResponse(request);
    return next(false, request.err);
  }

  next(false, undefined, responseResult(request, request.res.body));
}

/**
 * First item in body
 */
function bodyItem(request, next) {
  if (request.err) {
    applyErrorResponse(request);
    return next(false, request.err);
  }

  if (request.res.body && request.res.body.length) {
    return next(false, undefined, responseResult(request, request.res.body[0]));
  }

  next(false, undefined, responseResult(request));
}

/**
 * Empty
 */
function empty(request, next) {
  if (request.err) {
    applyErrorResponse(request);
    return next(false, request.err);
  }

  next(false, undefined, responseResult(request));
}

/**
 * Normalize keys
 */
function normalizeKeys(obj) {
  const result = {};

  if (obj) {
    for (const name in obj) {
      if (obj.hasOwnProperty(name)) {
        result[name.replace(/_/g, "").toLowerCase()] = obj[name];
      }
    }
  }

  return result;
}

/**
 * Defaults
 */
function defaults(obj) {
  if (!obj) obj = {};

  let src;
  for (let i = 0; i < arguments.length; i++) {
    src = arguments[i];
    for (const p in src) {
      if (src.hasOwnProperty(p) && !obj.hasOwnProperty(p)) {
        obj[p] = src[p];
      }
    }
  }

  return obj;
}

/**
 * Parse duration
 */
function parseDuration(value) {
  if (typeof value === "number") return value / 1e6;
  if (typeof value !== "string") return;

  let n;
  let m = value.match(/^(\d*\.?\d*)$/);

  if (m) {
    n = parseFloat(m[1]);

    if (!isNaN(n)) return n / 1e6;
  }

  m = value.match(/^([\d.]*)(ns|us|ms|s|m|h)$/);

  if (!m) return;

  n = parseFloat(m[1]);

  if (isNaN(n)) return;

  return (n * constants.DURATION_UNITS[m[2]]) / 1e6;
}

/**
 * Common options
 */
function options(req, opts, ignore) {
  if (!opts) opts = {};
  if (!ignore) ignore = {};

  if (!req.headers) req.headers = {};

  // headers
  if (opts.hasOwnProperty("token") && !ignore.token)
    req.headers["x-consul-token"] = opts.token;

  // query
  if (!req.query) req.query = {};

  if (opts.dc && !ignore.dc) req.query.dc = opts.dc;
  if (opts.wan && !ignore.wan) req.query.wan = "1";

  if (opts.consistent && !ignore.consistent) {
    req.query.consistent = "1";
  } else if (opts.stale && !ignore.stale) {
    req.query.stale = "1";
  }

  if (opts.hasOwnProperty("index") && !ignore.index)
    req.query.index = opts.index;
  if (opts.hasOwnProperty("wait") && !ignore.wait) req.query.wait = opts.wait;
  if (opts.hasOwnProperty("near") && !ignore.near) req.query.near = opts.near;
  if (opts.hasOwnProperty("node-meta") && !ignore["node-meta"]) {
    req.query["node-meta"] = opts["node-meta"];
  }
  if (opts.hasOwnProperty("filter") && !ignore.filter)
    req.query.filter = opts.filter;

  // papi
  if (opts.hasOwnProperty("ctx") && !ignore.ctx) req.ctx = opts.ctx;
  if (opts.hasOwnProperty("timeout") && !ignore.timeout) {
    if (typeof opts.timeout === "string") {
      req.timeout = parseDuration(opts.timeout);
    } else {
      req.timeout = opts.timeout;
    }
  }
}

/**
 * Default common options
 */
function defaultCommonOptions(opts) {
  opts = normalizeKeys(opts);
  let defaults;

  constants.DEFAULT_OPTIONS.forEach(function (key) {
    if (!opts.hasOwnProperty(key)) return;
    if (!defaults) defaults = {};
    defaults[key] = opts[key];
  });

  return defaults;
}

/**
 * Decode value
 */
function decode(value, opts) {
  if (typeof value !== "string") return value;
  value = Buffer.from(value, "base64");
  if (!opts || !opts.buffer) value = value.toString();
  return value;
}

/**
 * Shallow clone
 */
function clone(src) {
  const dst = {};

  for (const key in src) {
    if (src.hasOwnProperty(key)) {
      dst[key] = src[key];
    }
  }

  return dst;
}

/**
 * Set timeout with cancel support
 */
function setTimeoutContext(fn, ctx, timeout) {
  let id;

  const cancel = function () {
    clearTimeout(id);
  };

  id = setTimeout(function () {
    ctx.removeListener("cancel", cancel);

    fn();
  }, timeout);

  ctx.once("cancel", cancel);
}

/**
 * Set interval with cancel support
 */
function setIntervalContext(fn, ctx, timeout) {
  let id;

  const cancel = function () {
    clearInterval(id);
  };

  id = setInterval(function () {
    fn();
  }, timeout);

  ctx.once("cancel", cancel);
}

function _createTaggedAddress(src) {
  const dst = {};

  if (src.hasOwnProperty("address")) dst.Address = src.address;
  if (src.hasOwnProperty("port")) dst.Port = src.port;

  return dst;
}

function _createTaggedAddresses(src) {
  const dst = {};

  if (src.lan) {
    dst.lan = _createTaggedAddress(normalizeKeys(src.lan));
  }
  if (src.wan) {
    dst.wan = _createTaggedAddress(normalizeKeys(src.wan));
  }

  return dst;
}

/**
 * Create node/server-level check object
 * Corresponds to CheckType in Consul Agent Endpoint:
 * https://github.com/hashicorp/consul/blob/master/command/agent/check.go#L43
 * Corresponds to AgentServiceCheck in Consul Go API (which currently omits Notes):
 * https://github.com/hashicorp/consul/blob/master/api/agent.go#L66
 * Currently omits ID and Name fields:
 * https://github.com/hashicorp/consul/issues/2223
 */
function _createServiceCheck(src) {
  const dst = {};

  if (
    (src.grpc || src.http || src.tcp || src.args || src.script) &&
    src.interval
  ) {
    if (src.grpc) {
      dst.GRPC = src.grpc;
      if (src.hasOwnProperty("grpcusetls")) dst.GRPCUseTLS = src.grpcusetls;
    } else if (src.http) {
      dst.HTTP = src.http;
      if (src.hasOwnProperty("tlsskipverify"))
        dst.TLSSkipVerify = src.tlsskipverify;
    } else if (src.tcp) {
      dst.TCP = src.tcp;
    } else {
      if (src.args) {
        dst.Args = src.args;
      } else {
        dst.Script = src.script;
      }
      if (src.hasOwnProperty("dockercontainerid"))
        dst.DockerContainerID = src.dockercontainerid;
      if (src.hasOwnProperty("shell")) dst.Shell = src.shell;
    }
    dst.Interval = src.interval;
    if (src.hasOwnProperty("timeout")) dst.Timeout = src.timeout;
  } else if (src.ttl) {
    dst.TTL = src.ttl;
  } else if (src.aliasnode || src.aliasservice) {
    if (src.hasOwnProperty("aliasnode")) dst.AliasNode = src.aliasnode;
    if (src.hasOwnProperty("aliasservice")) dst.AliasService = src.aliasservice;
  } else {
    throw new Error(
      "args/grpc/http/tcp and interval, ttl, or aliasnode/aliasservice"
    );
  }
  if (src.hasOwnProperty("notes")) dst.Notes = src.notes;
  if (src.hasOwnProperty("status")) dst.Status = src.status;
  if (src.hasOwnProperty("deregistercriticalserviceafter")) {
    dst.DeregisterCriticalServiceAfter = src.deregistercriticalserviceafter;
  }
  if (src.hasOwnProperty("failuresbeforecritical")) {
    dst.FailuresBeforeCritical = src.failuresbeforecritical;
  }
  if (src.hasOwnProperty("successbeforepassing")) {
    dst.SuccessBeforePassing = src.successbeforepassing;
  }

  return dst;
}

function createServiceCheck(src) {
  return _createServiceCheck(normalizeKeys(src));
}

function _createServiceProxy(src) {
  const dst = {};

  if (src.destinationservicename) {
    dst.DestinationServiceName = src.destinationservicename;
  } else {
    throw Error("destinationservicename required");
  }
  if (src.destinationserviceid)
    dst.DestinationServiceID = src.destinationserviceid;
  if (src.localserviceaddress)
    dst.LocalServiceAddress = src.localserviceaddress;
  if (src.hasOwnProperty("localserviceport"))
    dst.LocalServicePort = src.localserviceport;
  if (src.config) dst.Config = src.config;
  if (src.upstreams) dst.Upstreams = src.upstreams;
  if (src.meshgateway) dst.MeshGateway = src.meshgateway;
  if (src.expose) dst.Expose = src.expose;

  return dst;
}

function _createService(src, isSidecar) {
  const dst = {};

  if (src.name) dst.Name = src.name;
  if (src.id) dst.ID = src.id;
  if (src.tags) dst.Tags = src.tags;
  if (src.meta) dst.Meta = src.meta;
  if (src.hasOwnProperty("address")) dst.Address = src.address;
  if (src.hasOwnProperty("port")) dst.Port = src.port;

  if (Array.isArray(src.checks)) {
    dst.Checks = src.checks.map(createServiceCheck);
  } else if (src.check) {
    dst.Check = createServiceCheck(src.check);
  }

  if (src.connect) {
    const connect = normalizeKeys(src.connect);

    dst.Connect = {};
    if (connect.hasOwnProperty("native")) dst.Connect.Native = connect.native;

    if (connect.proxy) {
      dst.Connect.Proxy = _createServiceProxy(normalizeKeys(connect.proxy));
    }

    if (connect.sidecarservice) {
      if (!isSidecar) {
        dst.Connect.SidecarService = _createService(
          normalizeKeys(connect.sidecarservice),
          true
        );
      } else {
        throw new Error("sidecarservice cannot be nested");
      }
    }
  }

  if (src.proxy) {
    dst.Proxy = _createServiceProxy(normalizeKeys(src.proxy));
  }

  if (src.taggedaddresses) {
    dst.TaggedAddresses = _createTaggedAddresses(
      normalizeKeys(src.taggedaddresses)
    );
  }

  return dst;
}

function createService(src) {
  return _createService(normalizeKeys(src));
}

/**
 * Create standalone check object
 * Corresponds to CheckDefinition in Consul Agent Endpoint:
 * https://github.com/hashicorp/consul/blob/master/command/agent/structs.go#L47
 * Corresponds to AgentCheckRegistration in Consul Go API:
 * https://github.com/hashicorp/consul/blob/master/api/agent.go#L57
 */
function createCheck(src) {
  src = normalizeKeys(src);

  const dst = _createServiceCheck(src);

  if (src.name) {
    dst.Name = src.name;
  } else {
    throw new Error("name required");
  }

  if (src.hasOwnProperty("id")) dst.ID = src.id;
  if (src.hasOwnProperty("serviceid")) dst.ServiceID = src.serviceid;

  return dst;
}

/**
 * Has the Consul index changed.
 */
function hasIndexChanged(index, prevIndex) {
  if (typeof index !== "string" || !index) return false;
  if (typeof prevIndex !== "string" || !prevIndex) return true;
  return index !== prevIndex;
}

/**
 * Parse query meta
 */
function parseQueryMeta(res) {
  const meta = {};

  if (res && res.headers) {
    if (res.headers["x-consul-index"]) {
      meta.LastIndex = res.headers["x-consul-index"];
    }
    if (res.headers["x-consul-lastcontact"]) {
      meta.LastContact = parseInt(res.headers["x-consul-lastcontact"], 10);
    }
    if (res.headers["x-consul-knownleader"]) {
      meta.KnownLeader = res.headers["x-consul-knownleader"] === "true";
    }
    if (res.headers["x-consul-translate-addresses"]) {
      meta.AddressTranslationEnabled =
        res.headers["x-consul-translate-addresses"] === "true";
    }
  }

  return meta;
}

exports.getAgent = getAgent;
exports.responseResult = responseResult;
exports.applyErrorResponse = applyErrorResponse;
exports.body = body;
exports.bodyItem = bodyItem;
exports.decode = decode;
exports.empty = empty;
exports.normalizeKeys = normalizeKeys;
exports.defaults = defaults;
exports.options = options;
exports.defaultCommonOptions = defaultCommonOptions;
exports.clone = clone;
exports.parseDuration = parseDuration;
exports.setTimeoutContext = setTimeoutContext;
exports.setIntervalContext = setIntervalContext;
exports.createServiceCheck = createServiceCheck;
exports.createService = createService;
exports.createCheck = createCheck;
exports.hasIndexChanged = hasIndexChanged;
exports.parseQueryMeta = parseQueryMeta;
