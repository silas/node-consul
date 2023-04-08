import { Consul } from "./consul";

interface CreateOptions {
  dc?: string;
  lockdelay?: string;
  node?: string;
  name?: string;
  checks?: string[];
  nodechecks?: string[];
  servicechecks?: { id: string; namespace?: string }[];
  behavior?: "release" | "delete";
  ttl?: string;
}

interface CreateResult {
  ID: string;
}

interface DestroyOptions {
  id: string;
  dc?: string;
  ns?: string;
}

type DestroyResult = boolean;

interface InfoOptions {
  id: string;
  dc?: string;
}

interface InfoResult {
  ID: string;
  Name: string;
  Node: string;
  LockDelay: number;
  Behavior: "release" | "delete";
  TTL: string;
  NodeChecks: string[] | null;
  ServiceChecks: string[] | null;
  CreateIndex: number;
  ModifyIndex: number;
}

type GetOptions = InfoOptions;

type GetResult = InfoResult;

interface NodeOptions {
  node: string;
  dc?: string;
}

type NodeResult = InfoResult[];

interface ListOptions {
  dc?: string;
}

type ListResult = InfoResult[];

interface RenewOptions {
  id: string;
  dc?: string;
}

type RenewResult = InfoResult[];

declare class Session {
  constructor(consul: Consul);

  consul: Consul;

  create(options?: CreateOptions): Promise<CreateResult>;

  destroy(options: DestroyOptions): Promise<DestroyResult>;
  destroy(id: string): Promise<DestroyResult>;

  info(options: InfoOptions): Promise<InfoResult>;
  info(id: string): Promise<InfoResult>;

  get(options: GetOptions): Promise<GetResult>;
  get(id: string): Promise<GetResult>;

  node(options: NodeOptions): Promise<NodeResult>;
  node(node: string): Promise<NodeResult>;

  list(options?: ListOptions): Promise<ListResult>;

  renew(options: RenewOptions): Promise<RenewResult>;
  renew(id: string): Promise<RenewResult>;
}
