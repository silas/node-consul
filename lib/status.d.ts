import { CommonOptions, Consul } from "./consul";

interface LeaderOptions extends CommonOptions {}

type LeaderResult = string;

interface PeersOptions extends CommonOptions {}

type PeersResult = string[];

declare class Status {
  constructor(consul: Consul);

  consul: Consul;

  leader(options?: LeaderOptions): Promise<LeaderResult>;

  peers(options?: PeersOptions): Promise<PeersResult>;
}
