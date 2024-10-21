import { CommonOptions, Consul } from "../consul";

interface ListOptions extends CommonOptions {
  filter?: string;
  ns?: string;
}

interface Check {
  Node: string;
  CheckID: string;
  Name: string;
  Status: "passing" | "warning" | "critical";
  Notes: string;
  Output: string;
  ServiceID: string;
  ServiceName: string;
  ServiceTags: string[];
  Interval: string;
  Timeout: string;
  Type: string;
  ExposedPort: number;
  Definition: any;
  Namespace: string;
  CreateIndex: number;
  ModifyIndex: number;
}

type ListResult = Record<string, Check>;

export interface CheckOptions {
  name: string;
  checkid?: string;
  serviceid?: string;
  http?: string;
  body?: string;
  header?: Record<string, string>;
  disableredirects?: boolean;
  h2ping?: string;
  h2pingusetls?: boolean;
  tlsskipverify?: boolean;
  tcp?: string;
  udp?: string;
  args?: string[];
  script?: string;
  dockercontainerid?: string;
  grpc?: string;
  grpcusetls?: boolean;
  shell?: string;
  timeout: string;
  interval?: string;
  ttl?: string;
  aliasnode?: string;
  aliasservice?: string;
  notes?: string;
  status?: string;
  deregistercriticalserviceafter?: string;
  failuresbeforewarning?: number;
  successbeforepassing?: number;
  failuresbeforecritical?: number;
}

interface RegisterOptions extends CheckOptions, CommonOptions {}

type RegisterResult = any;

interface DeregisterOptions extends CommonOptions {
  id: string;
}

type DeregisterResult = any;

interface PassOptions extends CommonOptions {
  id: string;
  note?: string;
}

type PassResult = any;

interface WarnOptions extends CommonOptions {
  id: string;
  note?: string;
}

type WarnResult = any;

interface FailOptions extends CommonOptions {
  id: string;
  note?: string;
}

type FailResult = any;

declare class AgentCheck {
  constructor(consul: Consul);

  consul: Consul;

  list(options?: ListOptions): Promise<ListResult>;

  register(options: RegisterOptions): Promise<RegisterResult>;

  deregister(options: DeregisterOptions): Promise<DeregisterResult>;
  deregister(id: string): Promise<DeregisterResult>;

  pass(options: PassOptions): Promise<PassResult>;
  pass(id: string): Promise<PassResult>;

  warn(options: WarnOptions): Promise<WarnResult>;
  warn(id: string): Promise<WarnResult>;

  fail(options: FailOptions): Promise<FailResult>;
  fail(id: string): Promise<FailResult>;
}
