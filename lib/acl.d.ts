import { AclLegacy } from "./acl/legacy";
import { CommonOptions, Consul } from "./consul";

interface BootstrapOptions extends CommonOptions {
  bootstrapsecret?: string;
}

type BootstrapResult = any;

interface ReplicationOptions extends CommonOptions {
  dc?: string;
}

interface ReplicationResult {
  Enabled: boolean;
  Running: boolean;
  SourceDatacenter: string;
  ReplicatedType: "policies" | "tokens";
  ReplicatedIndex: number;
  ReplicatedTokenIndex: number;
  LastSuccess: string;
  LastError: string;
  LastErrorMessage: string;
}

declare class Acl {
  constructor(consul: Consul);

  consul: Consul;
  legacy: AclLegacy;

  static Legacy: typeof AclLegacy;

  bootstrap(options?: BootstrapOptions): Promise<BootstrapResult>;

  replication(options?: ReplicationOptions): Promise<ReplicationResult>;
}
