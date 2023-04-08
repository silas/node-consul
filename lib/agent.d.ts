import { CommonOptions, Consul } from "./consul";
import {
  AgentCheck,
  ListOptions as CheckListOptions,
  ListResult as CheckListResult,
} from "./agent/check";
import {
  AgentService,
  ListOptions as ServiceListOptions,
  ListResult as ServiceListResult,
} from "./agent/service";

interface MembersOptions extends CommonOptions {
  wan?: boolean;
  segment?: string;
}

type MembersResult = any[];

interface ReloadOptions extends CommonOptions {}

type ReloadResult = any;

interface SelfOptions extends CommonOptions {}

type SelfResult = any;

interface MaintenanceOptions extends CommonOptions {
  enable: boolean;
  reason?: string;
}

type MaintenanceResult = any;

interface JoinOptions extends CommonOptions {
  address: string;
  wan?: boolean;
}

type JoinResult = any;

interface ForceLeaveOptions extends CommonOptions {
  node: string;
  prune?: boolean;
  wan?: boolean;
}

type ForceLeaveResult = any;

declare class Agent {
  constructor(consul: Consul);

  consul: Consul;
  check: AgentCheck;
  service: AgentService;

  static Check: typeof AgentCheck;
  static Service: typeof AgentService;

  checks(options?: CheckListOptions): Promise<CheckListResult>;

  services(options?: ServiceListOptions): Promise<ServiceListResult>;

  members(options?: MembersOptions): Promise<MembersResult>;

  reload(options?: ReloadOptions): Promise<ReloadResult>;

  self(options?: SelfOptions): Promise<SelfResult>;

  maintenance(options: MaintenanceOptions): Promise<MaintenanceResult>;
  maintenance(enable: boolean): Promise<MaintenanceResult>;

  join(options: JoinOptions): Promise<JoinResult>;
  join(address: string): Promise<JoinResult>;

  forceLeave(options: ForceLeaveOptions | string): Promise<ForceLeaveResult>;
}
