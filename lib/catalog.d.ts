import { CommonOptions, Consul } from "./consul";
import { CatalogConnect } from "./catalog/connect";
import {
  CatalogNode,
  ListOptions as NodeListOptions,
  ListResult as NodeListResult,
} from "./catalog/node";
import {
  CatalogService,
  ListOptions as ServiceListOptions,
  ListResult as ServiceListResult,
} from "./catalog/service";

interface DatacentersOptions extends CommonOptions {}

type DatacentersResult = string[];

type NodesOptions = NodeListOptions;

type NodesResult = NodeListResult;

interface RegisterService {
  id?: string;
  service: string;
  address?: string;
  port?: number;
  tags?: string[];
  meta?: Record<string, string>;
}

interface RegisterCheckHealthDefinitionBase {
  intervalduration: string;
  timeoutduration?: string;
  deregistercriticalserviceafterduration?: string;
}

interface RegisterCheckHealthDefinitionHttp
  extends RegisterCheckHealthDefinitionBase {
  http: string;
  tlsskipverify?: boolean;
  tlsservername?: string;
}

interface RegisterCheckHealthDefinitionTcp
  extends RegisterCheckHealthDefinitionBase {
  tcp: string;
}

type RegisterCheckHealthDefinition =
  | RegisterCheckHealthDefinitionHttp
  | RegisterCheckHealthDefinitionTcp;

interface RegisterCheck {
  node?: string;
  name?: string;
  checkid?: string;
  serviceid?: string;
  notes?: string;
  status?: "passing" | "warning" | "critical";
  definition?: RegisterCheckHealthDefinition;
}

interface RegisterOptions extends CommonOptions {
  id?: string;
  node: string;
  address: string;
  datacenter?: string;
  taggedaddresses?: Record<string, string>;
  nodemeta?: Record<string, string>;
  service?: RegisterService;
  check?: RegisterCheck;
  checks?: RegisterCheck[];
  skipnodeupdate?: boolean;
  namespace?: string;
}

type RegisterResult = any;

interface DeregisterOptions extends CommonOptions {
  node: string;
  datacenter?: string;
  checkid?: string;
  serviceid?: string;
  namespace?: string;
}

type DeregisterResult = any;

type ServicesOptions = ServiceListOptions;

type ServicesResult = ServiceListResult;

declare class Catalog {
  constructor(consul: Consul);

  consul: Consul;
  connect: CatalogConnect;
  node: CatalogNode;
  service: CatalogService;

  static Connect: typeof CatalogConnect;
  static Node: typeof CatalogNode;
  static Service: typeof CatalogService;

  datacenters(options?: DatacentersOptions): Promise<DatacentersResult>;

  nodes(options: NodesOptions): Promise<NodesResult>;
  nodes(service: string): Promise<NodesResult>;

  register(options: RegisterOptions): Promise<RegisterResult>;
  register(node: string): Promise<RegisterResult>;

  deregister(options: DeregisterOptions): Promise<DeregisterResult>;
  deregister(node: string): Promise<DeregisterResult>;

  services(options?: ServicesOptions): Promise<ServicesResult>;
  services(dc: string): Promise<ServicesResult>;
}
