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
    if (this._ctx) throw errors.Validation("lock in use");

    const ctx = (this._ctx = new events.EventEmitter());

    ctx.key = this._opts.key;
    ctx.session = utils.clone(this._opts.session);
    ctx.index = "0";
    ctx.end = false;
    ctx.lockWaitTime = this._opts.lockwaittime || DEFAULT_LOCK_WAIT_TIME;
    ctx.lockWaitTimeout =
      utils.parseDuration(ctx.lockWaitTime) +
      utils.parseDuration(
        this._opts.lockwaittimeout || DEFAULT_LOCK_WAIT_TIMEOUT
      );
    ctx.lockRetryTime = utils.parseDuration(
      this._opts.lockretrytime || DEFAULT_LOCK_RETRY_TIME
    );
    ctx.state = "session";
    ctx.value = this._opts.value || null;
    ctx.includeResponse = true;

    process.nextTick(() => {
      this._run(ctx);
    });
  }

  /**
   * Release lock
   */
  release() {
    const ctx = this._ctx;

    if (!ctx) throw errors.Validation("no lock in use");

    delete this._ctx;

    process.nextTick(() => {
      this._release(ctx);
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
    if (!ctx.session.id) {
      const opts = utils.defaults(
        {
          name: ctx.session.name || DEFAULT_LOCK_SESSION_NAME,
          ttl: ctx.session.ttl || DEFAULT_LOCK_SESSION_TTL,
          ctx: ctx,
        },
        ctx.session,
        this._defaults,
        this.consul._defaults
      );

      this.consul.session
        .create(opts)
        .then(([_, data]) => {
          ctx.session = {
            id: data.ID,
            ttl: opts.ttl,
          };

          ctx.state = "wait";

          const renewTimeout = utils.parseDuration(ctx.session.ttl) / 2;

          // renew session
          ctx.renewSession = setInterval(() => {
            const opts = utils.defaults(
              {
                id: ctx.session.id,
                timeout: renewTimeout,
                ctx: ctx,
              },
              this._defaults,
              this.consul._defaults
            );

            this.consul.session
              .renew(opts)
              .catch((err) => this._end(ctx, err, err.response));
          }, renewTimeout);

          return this._run(ctx);
        })
        .catch((err) => {
          err.message = "session create: " + err.message;
          return this._end(ctx, err, err.response);
        });

      return;
    }

    ctx.state = "wait";

    process.nextTick(() => {
      this._run(ctx);
    });
  }

  _wait(ctx) {
    const retry = () => {
      utils.setTimeoutContext(
        () => {
          this._run(ctx);
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
      this._defaults,
      this.consul._defaults
    );

    this.consul.kv
      .get(opts)
      .then(([res, data]) => {
        if (data) {
          // we try to use the same magic number as consul/api in an attempt to be
          // compatible
          if (data.Flags !== +LOCK_FLAG_VALUE) {
            const err = errors.Validation(
              "consul: lock: existing key does not match lock use"
            );
            return this._end(ctx, err, res);
          }

          const newIndex = res.headers["x-consul-index"];
          if (utils.hasIndexChanged(newIndex, ctx.index)) ctx.index = newIndex;

          if (data.Session !== ctx.Session) {
            this.emit("retry", { leader: data.Session });
            return retry();
          }
        } else if (res.statusCode !== 404) {
          return this._end(
            ctx,
            new Error("consul: lock: error getting key"),
            res
          );
        }

        ctx.state = "acquire";

        this._run(ctx);
      })
      .catch((err) => {
        this._end(ctx, err, err.response);
      });
  }

  _acquire(ctx) {
    const opts = utils.defaults(
      {
        key: ctx.key,
        acquire: ctx.session.id,
        ctx: ctx,
        value: ctx.value,
        flags: LOCK_FLAG_VALUE,
      },
      this._defaults,
      this.consul._defaults
    );

    this.consul.kv
      .set(opts)
      .then(([_, data]) => {
        if (data !== true) {
          ctx.state = "wait";

          return utils.setTimeoutContext(
            () => {
              this._run(ctx);
            },
            ctx,
            ctx.lockRetryTime
          );
        }

        ctx.held = true;
        this.emit("acquire");

        ctx.state = "monitor";

        this._run(ctx);
      })
      .catch((err) => {
        this._end(ctx, err, err.response);
      });
  }

  _monitor(ctx) {
    const monitor = (ctx.monitor = this.consul.watch({
      method: this.consul.kv.get,
      options: utils.defaults(
        {
          key: ctx.key,
          wait: ctx.lockWaitTime,
          timeout: ctx.lockWaitTimeout,
          index: ctx.index,
        },
        this._defaults,
        this.consul._defaults
      ),
    }));

    const ttl = ctx.session.ttl && utils.parseDuration(ctx.session.ttl);

    // monitor updates
    if (ttl) {
      utils.setIntervalContext(
        () => {
          const time = monitor.updateTime();

          if (time && new Date() - time > ttl + 1000) {
            monitor.end();
          }
        },
        ctx,
        Math.min(1000, ttl)
      );
    }

    monitor.on("change", (data) => {
      if (data) {
        if (data.Session !== ctx.session.id) {
          return monitor.end();
        }
      }
    });

    monitor.on("error", () => {
      // ignore errors
    });

    monitor.on("end", () => {
      this._end(ctx);
    });
  }

  _end(ctx, err, res) {
    if (ctx.end) return;
    ctx.end = true;

    delete this._ctx;

    if (err) this._err(err, res);

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
        this._defaults,
        this.consul._defaults
      );

      this.consul.session.destroy(opts).catch(() => null);

      delete ctx.renewSession;
    }

    // abort any pending requests
    ctx.emit("cancel");

    if (ctx.held) {
      ctx.held = false;
      this.emit("release");
    }

    this.emit("end");
  }

  _release(ctx) {
    if (ctx.held) {
      const opts = utils.defaults(
        {
          key: ctx.key,
          release: ctx.session.id,
          ctx: ctx,
          value: ctx.value,
          flags: LOCK_FLAG_VALUE,
        },
        this._defaults,
        this.consul._defaults
      );

      this.consul.kv
        .set(opts)
        .then(([_, data]) => {
          if (data !== true) {
            const err = new Error("failed to release lock");
            return this._end(ctx, err);
          }

          this._end(ctx);
        })
        .catch((err) => {
          this._end(ctx, err, err.response);
        });

      return;
    }

    process.nextTick(() => {
      this._end(ctx);
    });
  }
}

exports.Lock = Lock;
