import { Agent as httpAgent } from "http";
import { Agent as httpsAgent } from "https";
import {
  Acl,
  BootstrapOptions as AclBootstrapOptions,
  BootstrapResult as AclBootstrapResult,
  ReplicationOptions as AclReplicationOptions,
  ReplicationResult as AclReplicationResult,
} from "./acl";
import {
  Agent,
  MembersOptions as AgentMembersOptions,
  MembersResult as AgentMembersResult,
  ReloadOptions as AgentReloadOptions,
  ReloadResult as AgentReloadResult,
  SelfOptions as AgentSelfOptions,
  SelfResult as AgentSelfResult,
  MaintenanceOptions as AgentMaintenanceOptions,
  MaintenanceResult as AgentMaintenanceResult,
  JoinOptions as AgentJoinOptions,
  JoinResult as AgentJoinResult,
  ForceLeaveOptions as AgentForceLeaveOptions,
  ForceLeaveResult as AgentForceLeaveResult,
} from "./agent";
import {
  Catalog,
  DatacentersOptions as CatalogDatacentersOptions,
  DatacentersResult as CatalogDatacentersResult,
} from "./catalog";
import {
  Event,
  FireOptions as EventFireOptions,
  FireResult as EventFireResult,
  ListOptions as EventListOptions,
  ListResult as EventListResult,
} from "./event";
import {
  Health,
  NodeOptions as HealthNodeOptions,
  Node as HealthNode,
  NodeResult as HealthNodeResult,
  ChecksOptions as HealthChecksOptions,
  ChecksResult as HealthChecksResult,
  ServiceOptions as HealthServiceOptions,
  ServiceResult as HealthServiceResult,
  StateOptions as HealthStateOptions,
  StateResult as HealthStateResult,
} from "./health";
import {
  Kv,
  GetOptions as KvGetOptions,
  GetOptionsRecurse as KvGetOptionsRecurse,
  GetItem as KvGetItem,
  GetResult as KvGetResult,
  GetResultRecurse as KvGetResultRecurse,
  KeysOptions as KvKeysOptions,
  KeysResult as KvKeysResult,
  SetOptions as KvSetOptions,
  SetResult as KvSetResult,
  DelOptions as KvDelOptions,
  DelResult as KvDelResult,
} from "./kv";
import {
  Query,
  ListOptions as QueryListOptions,
  ListResult as QueryListResult,
  CreateServiceOptions as QueryCreateServiceOptions,
  CreateDnsOptions as QueryCreateDnsOptions,
  CreateOptions as QueryCreateOptions,
  CreateResult as QueryCreateResult,
  GetOptions as QueryGetOptions,
  GetResult as QueryGetResult,
  UpdateOptions as QueryUpdateOptions,
  UpdateResult as QueryUpdateResult,
  ExecuteOptions as QueryExecuteOptions,
  ExecuteResult as QueryExecuteResult,
  ExplainOptions as QueryExplainOptions,
  ExplainResult as QueryExplainResult,
} from "./query";
import {
  Session,
  CreateOptions as SessionCreateOptions,
  CreateResult as SessionCreateResult,
  DestroyOptions as SessionDestroyOptions,
  DestroyResult as SessionDestroyResult,
  InfoOptions as SessionInfoOptions,
  InfoResult as SessionInfoResult,
  GetOptions as SessionGetOptions,
  GetResult as SessionGetResult,
  NodeOptions as SessionNodeOptions,
  NodeResult as SessionNodeResult,
  ListOptions as SessionListOptions,
  ListResult as SessionListResult,
  RenewOptions as SessionRenewOptions,
  RenewResult as SessionRenewResult,
} from "./session";
import {
  Status,
  LeaderOptions as StatusLeaderOptions,
  LeaderResult as StatusLeaderResult,
  PeersOptions as StatusPeersOptions,
  PeersResult as StatusPeersResult,
} from "./status";
import {
  Transaction,
  KVOption as TransactionKVOption,
  NodeOption as TransactionNodeOption,
  ServiceOption as TransactionServiceOption,
  CheckOption as TransactionCheckOption,
  Operation as TransactionOperation,
  CreateOptions as TransactionCreateOptions,
  CreateResult as TransactionCreateResult,
} from "./transaction";
import { Watch, WatchOptions as WatchWatchOptions } from "./watch";

export interface CommonOptions {
  token?: string;
}

interface DefaultOptions extends CommonOptions {
  dc?: string;
  partition?: string;
  wan?: boolean;
  consistent?: boolean;
  stale?: boolean;
  index?: string;
  wait?: string;
  near?: string;
  filter?: string;
}

interface ConsulOptions {
  host?: string;
  port?: number;
  secure?: boolean;
  defaults?: DefaultOptions;
  agent?: httpAgent | httpsAgent;
}

declare class Consul {
  constructor(options?: Consul.Options);

  acl: Acl;
  agent: Agent;
  catalog: Catalog;
  event: Event;
  health: Health;
  kv: Kv;
  query: Query;
  session: Session;
  status: Status;
  transaction: Transaction;

  static Acl: typeof Acl;
  static Agent: typeof Agent;
  static Catalog: typeof Catalog;
  static Event: typeof Event;
  static Health: typeof Health;
  static Kv: typeof Kv;
  static Query: typeof Query;
  static Session: typeof Session;
  static Status: typeof Status;
  static Transaction: typeof Transaction;
  static Watch: typeof Watch;

  static AclInstance: Acl;
  static AgentInstance: Agent;
  static CatalogInstance: Catalog;
  static EventInstance: Event;
  static HealthInstance: Health;
  static KvInstance: Kv;
  static QueryInstance: Query;
  static SessionInstance: Session;
  static StatusInstance: Status;
  static TransactionInstance: Transaction;
  static WatchInstance: Watch;

  destroy(): void;

  watch(options: Consul.Watch.WatchOptions): Watch;
}

declare namespace Consul {
  type ConsulCommonOptions = CommonOptions;
  type ConsulDefaultOptions = DefaultOptions;
  type Options = ConsulOptions;

  namespace Acl {
    type BootstrapOptions = AclBootstrapOptions;
    type BootstrapResult = AclBootstrapResult;
    type ReplicationOptions = AclReplicationOptions;
    type ReplicationResult = AclReplicationResult;
  }

  namespace Agent {
    type MembersOptions = AgentMembersOptions;
    type MembersResult = AgentMembersResult;
    type ReloadOptions = AgentReloadOptions;
    type ReloadResult = AgentReloadResult;
    type SelfOptions = AgentSelfOptions;
    type SelfResult = AgentSelfResult;
    type MaintenanceOptions = AgentMaintenanceOptions;
    type MaintenanceResult = AgentMaintenanceResult;
    type JoinOptions = AgentJoinOptions;
    type JoinResult = AgentJoinResult;
    type ForceLeaveOptions = AgentForceLeaveOptions;
    type ForceLeaveResult = AgentForceLeaveResult;
  }

  namespace Catalog {
    type DatacentersOptions = CatalogDatacentersOptions;
    type DatacentersResult = CatalogDatacentersResult;
  }

  namespace Event {
    type FireOptions = EventFireOptions;
    type FireResult = EventFireResult;
    type ListOptions = EventListOptions;
    type ListResult = EventListResult;
  }

  namespace Health {
    type NodeOptions = HealthNodeOptions;
    type Node = HealthNode;
    type NodeResult = HealthNodeResult;
    type ChecksOptions = HealthChecksOptions;
    type ChecksResult = HealthChecksResult;
    type ServiceOptions = HealthServiceOptions;
    type ServiceResult = HealthServiceResult;
    type StateOptions = HealthStateOptions;
    type StateResult = HealthStateResult;
  }

  namespace Kv {
    type GetOptions = KvGetOptions;
    type GetOptionsRecurse = KvGetOptionsRecurse;
    type GetItem = KvGetItem;
    type GetResult = KvGetResult;
    type GetResultRecurse = KvGetResultRecurse;
    type KeysOptions = KvKeysOptions;
    type KeysResult = KvKeysResult;
    type SetOptions = KvSetOptions;
    type SetResult = KvSetResult;
    type DelOptions = KvDelOptions;
    type DelResult = KvDelResult;
  }

  namespace Query {
    type ListOptions = QueryListOptions;
    type ListResult = QueryListResult;
    type CreateServiceOptions = QueryCreateServiceOptions;
    type CreateDnsOptions = QueryCreateDnsOptions;
    type CreateOptions = QueryCreateOptions;
    type CreateResult = QueryCreateResult;
    type GetOptions = QueryGetOptions;
    type GetResult = QueryGetResult;
    type UpdateOptions = QueryUpdateOptions;
    type UpdateResult = QueryUpdateResult;
    type ExecuteOptions = QueryExecuteOptions;
    type ExecuteResult = QueryExecuteResult;
    type ExplainOptions = QueryExplainOptions;
    type ExplainResult = QueryExplainResult;
  }

  namespace Session {
    type CreateOptions = SessionCreateOptions;
    type CreateResult = SessionCreateResult;
    type DestroyOptions = SessionDestroyOptions;
    type DestroyResult = SessionDestroyResult;
    type InfoOptions = SessionInfoOptions;
    type InfoResult = SessionInfoResult;
    type GetOptions = SessionGetOptions;
    type GetResult = SessionGetResult;
    type NodeOptions = SessionNodeOptions;
    type NodeResult = SessionNodeResult;
    type ListOptions = SessionListOptions;
    type ListResult = SessionListResult;
    type RenewOptions = SessionRenewOptions;
    type RenewResult = SessionRenewResult;
  }

  namespace Status {
    type LeaderOptions = StatusLeaderOptions;
    type LeaderResult = StatusLeaderResult;
    type PeersOptions = StatusPeersOptions;
    type PeersResult = StatusPeersResult;
  }

  namespace Transaction {
    type KVOption = TransactionKVOption;
    type NodeOption = TransactionNodeOption;
    type ServiceOption = TransactionServiceOption;
    type CheckOption = TransactionCheckOption;
    type Operation = TransactionOperation;
    type CreateOptions = TransactionCreateOptions;
    type CreateResult = TransactionCreateResult;
  }

  namespace Watch {
    type WatchOptions = WatchWatchOptions;
  }
}

export { Consul };
