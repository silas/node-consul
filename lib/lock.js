const events = require("events");

const errors = require("./errors");
const utils = require("./utils");

const DEFAULT_LOCK_SESSION_NAME = "Consul API Lock";
const DEFAULT_LOCK_SESSION_TTL = "15s";
const DEFAULT_LOCK_WAIT_TIME = "15s";
const DEFAULT_LOCK_WAIT_TIMEOUT = "1s";
const DEFAULT_LOCK_RETRY_TIME = "5s";

// magic flag 0x2ddccbc058a50c18
const LOCK_FLAG_VALUE = "3304740253564472344";

/**
 * Lock
 */
class Lock extends events.EventEmitter {
  constructor(consul, opts) {
    super();

    opts = utils.normalizeKeys(opts);

    this.consul = consul;
    this._opts = opts;
    this._defaults = utils.defaultCommonOptions(opts);

    if (opts.session) {
      switch (typeof opts.session) {
        case "string":
          opts.session = { id: opts.session };
          break;
        case "object":
          opts.session = utils.normalizeKeys(opts.session);
          break;
        default:
          throw errors.Validation("session must be an object or string");
      }
    } else {
      opts.session = {};
    }

    if (!opts.key) {
      throw errors.Validation("key required");
    } else if (typeof opts.key !== "string") {
      throw errors.Validation("key must be a string");
    }
  }

  acquire() {
    const self = this;

    if (self._ctx) throw errors.Validation("lock in use");

    const ctx = (self._ctx = new events.EventEmitter());

    ctx.key = self._opts.key;
    ctx.session = utils.clone(self._opts.session);
    ctx.index = "0";
    ctx.end = false;
    ctx.lockWaitTime = self._opts.lockwaittime || DEFAULT_LOCK_WAIT_TIME;
    ctx.lockWaitTimeout =
      utils.parseDuration(ctx.lockWaitTime) +
      utils.parseDuration(
        self._opts.lockwaittimeout || DEFAULT_LOCK_WAIT_TIMEOUT
      );
    ctx.lockRetryTime = utils.parseDuration(
      self._opts.lockretrytime || DEFAULT_LOCK_RETRY_TIME
    );
    ctx.state = "session";
    ctx.value = self._opts.value || null;
    ctx.includeResponse = true;

    process.nextTick(function () {
      self._run(ctx);
    });
  }

  /**
   * Release lock
   */
  release() {
    const self = this;

    const ctx = self._ctx;

    if (!self._ctx) throw errors.Validation("no lock in use");

    delete self._ctx;

    process.nextTick(function () {
      self._release(ctx);
    });
  }

  _err(err, res) {
    this.emit("error", err, res);
  }

  _run(ctx) {
    if (ctx.end) return;

    switch (ctx.state) {
      case "session":
        return this._session(ctx);
      case "wait":
        return this._wait(ctx);
      case "acquire":
        return this._acquire(ctx);
      case "monitor":
        return this._monitor(ctx);
      default:
        throw new Error("invalid state: " + ctx.state);
    }
  }

  _session(ctx) {
    const self = this;

    if (!ctx.session.id) {
      const opts = utils.defaults(
        {
          name: ctx.session.name || DEFAULT_LOCK_SESSION_NAME,
          ttl: ctx.session.ttl || DEFAULT_LOCK_SESSION_TTL,
          ctx: ctx,
        },
        ctx.session,
        self._defaults,
        self.consul._defaults
      );

      self.consul.session
        .create(opts)
        .then(([_, data]) => {
          ctx.session = {
            id: data.ID,
            ttl: opts.ttl,
          };

          ctx.state = "wait";

          const renewTimeout = utils.parseDuration(ctx.session.ttl) / 2;

          // renew session
          ctx.renewSession = setInterval(function () {
            const opts = utils.defaults(
              {
                id: ctx.session.id,
                timeout: renewTimeout,
                ctx: ctx,
              },
              self._defaults,
              self.consul._defaults
            );

            self.consul.session
              .renew(opts)
              .catch((err) => self._end(ctx, err, err.response));
          }, renewTimeout);

          return self._run(ctx);
        })
        .catch((err) => {
          err.message = "session create: " + err.message;
          return self._end(ctx, err, err.response);
        });

      return;
    }

    ctx.state = "wait";

    process.nextTick(function () {
      self._run(ctx);
    });
  }

  _wait(ctx) {
    const self = this;

    const retry = function () {
      utils.setTimeoutContext(
        function () {
          self._run(ctx);
        },
        ctx,
        ctx.lockRetryTime
      );
    };

    const opts = utils.defaults(
      {
        key: ctx.key,
        wait: ctx.lockWaitTime,
        timeout: ctx.lockWaitTimeout,
        ctx: ctx,
        index: ctx.index,
      },
      self._defaults,
      self.consul._defaults
    );

    self.consul.kv
      .get(opts)
      .then(([res, data]) => {
        if (data) {
          // we try to use the same magic number as consul/api in an attempt to be
          // compatible
          if (data.Flags !== +LOCK_FLAG_VALUE) {
            const err = errors.Validation(
              "consul: lock: existing key does not match lock use"
            );
            return self._end(ctx, err, res);
          }

          const newIndex = res.headers["x-consul-index"];
          if (utils.hasIndexChanged(newIndex, ctx.index)) ctx.index = newIndex;

          if (data.Session !== ctx.Session) {
            self.emit("retry", { leader: data.Session });
            return retry();
          }
        } else if (res.statusCode !== 404) {
          return self._end(
            ctx,
            new Error("consul: lock: error getting key"),
            res
          );
        }

        ctx.state = "acquire";

        self._run(ctx);
      })
      .catch((err) => {
        self._end(ctx, err, err.response);
      });
  }

  _acquire(ctx) {
    const self = this;

    const opts = utils.defaults(
      {
        key: ctx.key,
        acquire: ctx.session.id,
        ctx: ctx,
        value: ctx.value,
        flags: LOCK_FLAG_VALUE,
      },
      self._defaults,
      self.consul._defaults
    );

    self.consul.kv
      .set(opts)
      .then(([_, data]) => {
        if (data !== true) {
          ctx.state = "wait";

          return utils.setTimeoutContext(
            function () {
              self._run(ctx);
            },
            ctx,
            ctx.lockRetryTime
          );
        }

        ctx.held = true;
        self.emit("acquire");

        ctx.state = "monitor";

        self._run(ctx);
      })
      .catch((err) => {
        self._end(ctx, err, err.response);
      });
  }

  _monitor(ctx) {
    const self = this;

    const monitor = (ctx.monitor = self.consul.watch({
      method: self.consul.kv.get,
      options: utils.defaults(
        {
          key: ctx.key,
          wait: ctx.lockWaitTime,
          timeout: ctx.lockWaitTimeout,
          index: ctx.index,
        },
        self._defaults,
        self.consul._defaults
      ),
    }));

    const ttl = ctx.session.ttl && utils.parseDuration(ctx.session.ttl);

    // monitor updates
    if (ttl) {
      utils.setIntervalContext(
        function () {
          const time = monitor.updateTime();

          if (time && new Date() - time > ttl + 1000) {
            monitor.end();
          }
        },
        ctx,
        Math.min(1000, ttl)
      );
    }

    monitor.on("change", function (data) {
      if (data) {
        if (data.Session !== ctx.session.id) {
          return monitor.end();
        }
      }
    });

    monitor.on("error", function () {
      // ignore errors
    });

    monitor.on("end", function () {
      self._end(ctx);
    });
  }

  _end(ctx, err, res) {
    const self = this;

    if (ctx.end) return;
    ctx.end = true;

    delete self._ctx;

    if (err) self._err(err, res);

    if (ctx.monitor) {
      ctx.monitor.removeAllListeners();
      ctx.monitor.end();

      delete ctx.monitor;
    }

    if (ctx.renewSession) {
      clearInterval(ctx.renewSession);

      const opts = utils.defaults(
        {
          id: ctx.session.id,
          timeout: 1000,
        },
        self._defaults,
        self.consul._defaults
      );

      self.consul.session.destroy(opts).catch(() => null);

      delete ctx.renewSession;
    }

    // abort any pending requests
    ctx.emit("cancel");

    if (ctx.held) {
      ctx.held = false;
      self.emit("release");
    }

    self.emit("end");
  }

  _release(ctx) {
    const self = this;

    if (ctx.held) {
      const opts = utils.defaults(
        {
          key: ctx.key,
          release: ctx.session.id,
          ctx: ctx,
          value: ctx.value,
          flags: LOCK_FLAG_VALUE,
        },
        self._defaults,
        self.consul._defaults
      );

      self.consul.kv
        .set(opts)
        .then(([_, data]) => {
          if (data !== true) {
            const err = new Error("failed to release lock");
            return self._end(ctx, err);
          }

          self._end(ctx);
        })
        .catch((err) => {
          self._end(ctx, err, err.response);
        });

      return;
    }

    process.nextTick(function () {
      self._end(ctx);
    });
  }
}

exports.Lock = Lock;
