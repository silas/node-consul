"use strict";

require("should");

const nock = require("nock");
const sinon = require("sinon");

const Consul = require("../lib");

function setup(scope) {
  if (scope._setup) return;
  scope._setup = true;

  beforeEach.call(scope, function () {
    const self = this;

    self.sinon = sinon.createSandbox();

    nock.disableNetConnect();

    Object.defineProperty(self, "consul", {
      configurable: true,
      enumerable: true,
      get: function () {
        return new Consul();
      },
    });

    Object.defineProperty(self, "nock", {
      configurable: true,
      enumerable: true,
      get: function () {
        return nock("http://127.0.0.1:8500");
      },
    });
  });

  afterEach.call(scope, function () {
    this.sinon.restore();

    nock.cleanAll();
  });
}

exports.consul = (opts) => new Consul(opts);
exports.setup = setup;
