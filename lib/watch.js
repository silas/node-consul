const events = require("events");

const errors = require("./errors");
const utils = require("./utils");

/**
 * Initialize a new `Watch` instance.
 */

class Watch extends events.EventEmitter {
  constructor(consul, opts) {
    super();

    this.consul = consul;

    opts = utils.normalizeKeys(opts);

    let options = utils.normalizeKeys(opts.options || {});
    options = utils.defaults(options, consul._defaults);
    options.wait = options.wait || "30s";
    options.index = utils.safeBigInt(options.index || "0");

    if (
      typeof options.timeout !== "string" &&
      typeof options.timeout !== "number"
    ) {
      const wait = utils.parseDuration(options.wait);
      // A small random amount of additional wait time is added to the supplied
      // maximum wait time to spread out the wake up time of any concurrent
      // requests. This adds up to wait / 16 additional time to the maximum duration.
      options.timeout = Math.ceil(wait + Math.max(wait * 0.1, 500));
    }

    let backoffFactor = 100;
    if (
      opts.hasOwnProperty("backofffactor") &&
      typeof opts.backofffactor === "number"
    ) {
      backoffFactor = opts.backofffactor;
    }
    let backoffMax = 30 * 1000;
    if (
      opts.hasOwnProperty("backoffmax") &&
      typeof opts.backoffmax === "number"
    ) {
      backoffMax = opts.backoffmax;
    }
    let maxAttempts = -1;
    if (
      opts.hasOwnProperty("maxattempts") &&
      typeof opts.maxattempts === "number"
    ) {
      maxAttempts = opts.maxattempts;
    }

    this._context = { consul: consul };
    this._options = options;
    this._attempts = 0;
    this._maxAttempts = maxAttempts;
    this._backoffMax = backoffMax;
    this._backoffFactor = backoffFactor;
    this._method = opts.method;
    this.includeResponse = true;

    if (typeof opts.method !== "function") {
      throw errors.Validation("method required");
    }

    process.nextTick(() => this._run());
  }

  /**
   * Is running
   */
  isRunning() {
    return !this._end;
  }

  /**
   * Update time
   */
  updateTime() {
    return this._updateTime;
  }

  /**
   * End watch
   */
  end() {
    if (this._end) return;
    this._end = true;

    this.emit("cancel");
    this.emit("end");
  }

  /**
   * Wait
   */
  _wait() {
    this._attempts += 1;
    if (this._attemptsMaxed) {
      return this._backoffMax;
    }
    const timeout = Math.pow(2, this._attempts) * this._backoffFactor;
    if (timeout < this._backoffMax) {
      return timeout;
    } else {
      this._attemptsMaxed = true;
      return this._backoffMax;
    }
  }

  /**
   * Error helper
   */
  _err(err, res) {
    if (this._end) return;

    this.emit("error", err, res);

    if (err && err.isValidation) return this.end();
    if (res && res.statusCode === 400) return this.end();
    if (this._maxAttempts >= 0 && this._attempts >= this._maxAttempts)
      return this.end();

    utils.setTimeoutContext(
      () => {
        this._run();
      },
      this,
      this._wait()
    );
  }

  /**
   * Run
   */
  _run() {
    if (this._end) return;

    const opts = utils.clone(this._options);
    opts.ctx = this;

    this._method
      .call(this._context, opts)
      .then(([res, data]) => {
        this._updateTime = +new Date();

        this._attempts = 0;
        this._attemptsMaxed = false;

        const newIndex = utils.safeBigInt(res.headers["x-consul-index"]);
        if (newIndex === undefined) {
          return this._err(errors.Validation("Watch not supported"), res);
        }
        if (newIndex === 0n) {
          return this._err(
            errors.Consul("Consul returned zero index value"),
            res
          );
        }

        const prevIndex = this._options.index;
        const reset = prevIndex !== undefined && newIndex < prevIndex;

        if (reset || utils.hasIndexChanged(newIndex, prevIndex)) {
          this._options.index = reset ? 0n : newIndex;

          this.emit("change", data, res);
        }

        process.nextTick(() => {
          this._run();
        });
      })
      .catch((err) => {
        this._err(err, err.response);
      });
  }
}

exports.Watch = Watch;
