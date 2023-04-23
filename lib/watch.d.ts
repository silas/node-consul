import { EventEmitter } from "events";
import { CommonOptions, Consul } from "./consul";

interface WatchOptions extends CommonOptions {
  method: Function;
  options: Record<string, string>;
  backoffFactor?: number;
  backoffMax?: number;
  maxAttempts?: number;
}

declare class Watch extends EventEmitter {
  constructor(consul: Consul, options: WatchOptions);

  consul: Consul;

  isRunning(): boolean;

  updateTime(): number;

  end(): void;
}
