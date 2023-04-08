import { CommonOptions, Consul } from "./consul";

interface ListOptions extends CommonOptions {}

type ListResult = any[];

interface CreateServiceOptions {
  service: string;
  namespace?: string;
  failover?: {
    nearestn?: number;
    datacenters?: string[];
    targets?: { peer?: string; datacenter?: string }[];
  };
  ignorecheckids?: string[];
  onlypassing?: boolean;
  near?: string;
}

interface CreateDnsOptions {
  ttl?: string;
}

interface CreateOptions extends CommonOptions {
  name?: string;
  session?: string;
  token?: string;
  service: CreateServiceOptions;
  tags?: string[];
  nodemeta?: Record<string, string>;
  servicemeta?: Record<string, string>;
  connect?: boolean;
  dns?: CreateDnsOptions;
}

interface CreateResult {
  ID: string;
}

interface GetOptions extends CommonOptions {
  query: string;
}

type GetResult = any;

interface UpdateOptions extends CreateOptions {
  query: string;
}

type UpdateResult = any;

interface ExecuteOptions extends CommonOptions {
  query: string;
}

type ExecuteResult = any;

interface ExplainOptions extends CommonOptions {
  query: string;
}

type ExplainResult = any;

declare class Query {
  constructor(consul: Consul);

  consul: Consul;

  list(options?: ListOptions): Promise<ListResult>;

  create(options: CreateOptions): Promise<CreateResult>;
  create(service: string): Promise<CreateResult>;

  get(options: GetOptions): Promise<GetResult>;
  get(query: string): Promise<GetResult>;

  update(options: UpdateOptions): Promise<UpdateResult>;

  execute(options: ExecuteOptions): Promise<ExecuteResult>;
  execute(query: string): Promise<ExecuteResult>;

  explain(options: ExplainOptions): Promise<ExplainResult>;
  explain(query: string): Promise<ExplainResult>;
}
