import { CommonOptions, Consul } from "../consul";

interface ListOptions extends CommonOptions {
  filter?: string;
}

type ListResult = Record<string, any>;

interface RegisterCheck {
  http?: string;
  tcp?: string;
  script?: string;
  dockercontainerid?: string;
  shell?: string;
  interval?: string;
  timeout?: string;
  ttl?: string;
  notes?: string;
  status?: string;
  deregistercriticalserviceafter?: string;
}

interface RegisterConnect {
  native?: boolean;
  proxy?: any;
  sidecarservice: Record<string, any>;
}

interface RegisterOptions extends CommonOptions {
  name: string;
  id?: string;
  tags?: string[];
  address?: string;
  taggedaddresses?: Record<string, any>;
  meta?: Record<string, string>;
  namespace?: string;
  port?: number;
  kind?: string;
  proxy?: any;
  connect?: RegisterConnect;
  check?: RegisterCheck;
  checks?: RegisterCheck[];
}

type RegisterResult = any;

interface DeregisterOptions extends CommonOptions {
  id: string;
}

type DeregisterResult = any;

interface MaintenanceOptions extends CommonOptions {
  id: string;
  enable: boolean;
  reason?: string;
  ns?: string;
}

type MaintenanceResult = any;

declare class AgentService {
  constructor(consul: Consul);

  consul: Consul;

  list(options?: ListOptions): Promise<ListResult>;

  register(options: RegisterOptions): Promise<RegisterResult>;
  register(name: string): Promise<RegisterResult>;

  deregister(options: DeregisterOptions): Promise<DeregisterResult>;
  deregister(id: string): Promise<DeregisterResult>;

  maintenance(options: MaintenanceOptions): Promise<MaintenanceResult>;
}
