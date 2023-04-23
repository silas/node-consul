import { CommonOptions, Consul } from "../consul";

interface ListOptions extends CommonOptions {
  dc?: string;
  ns?: string;
  filter?: string;
}

type ListResult = Record<string, string[]>;

interface NodesOptions extends CommonOptions {
  service: string;
  dc?: string;
  tag?: string;
  near?: string;
  filter?: string;
  ns?: string;
}

type NodesResult = any[];

declare class CatalogService {
  constructor(consul: Consul);

  consul: Consul;

  list(options?: ListOptions): Promise<ListResult>;
  list(dc: string): Promise<ListResult>;

  nodes(options: NodesOptions): Promise<NodesResult>;
  nodes(service: string): Promise<NodesResult>;
}
