import { CommonOptions, Consul } from "./consul";

interface NodeOptions extends CommonOptions {
  name: string;
  dc?: string;
  filter?: string;
  ns?: string;
}

interface Node {
  ID: string;
  Node: string;
  CheckID: string;
  Name: string;
  Status: "passing" | "warning" | "critical";
  Notes: string;
  Output: string;
  ServiceID: string;
  ServiceName: string;
  ServiceTags: string[];
  Namespace: string;
}

type NodeResult = Node[];

interface ChecksOptions extends CommonOptions {
  service: string;
  dc?: string;
  near?: string;
  filter?: string;
  ns?: string;
}

type ChecksResult = Node[];

interface ServiceOptions extends CommonOptions {
  service: string;
  dc?: string;
  near?: string;
  tag?: string;
  passing?: boolean;
  filter?: string;
  peer?: string;
  ns?: string;
}

type ServiceResult = any[];

interface StateOptions extends CommonOptions {
  state: "any" | "passing" | "warning" | "critical";
  dc?: string;
  near?: string;
  filter?: string;
  ns?: string;
}

type StateResult = Node[];

declare class Health {
  constructor(consul: Consul);

  consul: Consul;

  node(options: NodeOptions): Promise<NodeResult>;
  node(name: string): Promise<NodeResult>;

  checks(options: ChecksOptions): Promise<ChecksResult>;
  checks(service: string): Promise<ChecksResult>;

  service(options: ServiceOptions): Promise<ServiceResult>;
  service(service: string): Promise<ServiceResult>;

  state(options: StateOptions): Promise<StateResult>;
  state(
    state: "any" | "passing" | "warning" | "critical",
  ): Promise<StateResult>;
}
