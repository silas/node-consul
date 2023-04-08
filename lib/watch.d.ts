import {EventEmitter} from "events";
import {Consul} from "./consul";

interface WatchOptions {
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
