import { Consul } from "./consul";

interface LeaderOptions {}

type LeaderResult = string;

interface PeersOptions {}

type PeersResult = string[];

declare class Status {
  constructor(consul: Consul);

  consul: Consul;

  leader(options?: LeaderOptions): Promise<LeaderResult>;

  peers(options?: PeersOptions): Promise<PeersResult>;
}
