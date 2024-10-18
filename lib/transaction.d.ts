import { CommonOptions, Consul } from "./consul";

interface KVOption {
  verb: string;
  key: string;
  value?: string;
  flags?: number;
  index?: number;
  session?: string;
  namespace?: string;
}

interface NodeOption {
  verb: string;
  node: any;
}

interface ServiceOption {
  verb: string;
  node: string;
  service: any;
}

interface CheckOption {
  verb: string;
  check: any;
}

type Operation = KVOption | NodeOption | ServiceOption | CheckOption;

interface CreateOptions extends CommonOptions {
  operations: Operation[];
}

interface CreateResult {
  Results?: Record<"KV" | "Node" | "Service" | "Check", any>[];
  Errors?: any[];
}

declare class Transaction {
  constructor(consul: Consul);

  consul: Consul;

  create(options: CreateOptions): Promise<CreateResult>;
  create(
    operations: Operation[],
    options: CreateOptions,
  ): Promise<CreateResult>;
}
