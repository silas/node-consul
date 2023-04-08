import { CommonOptions, Consul } from "../consul";

interface ListOptions extends CommonOptions {
  dc?: string;
  near?: string;
  filter?: string;
}

type ListResult = any[];

interface ServicesOptions extends CommonOptions {
  node: string;
  dc?: string;
  filter?: string;
  ns?: string;
}

type ServicesResult = any;

declare class CatalogNode {
  constructor(consul: Consul);

  consul: Consul;

  list(options?: ListOptions): Promise<ListResult>;
  list(dc: string): Promise<ListResult>;

  services(options: ServicesOptions): Promise<ServicesResult>;
  services(node: string): Promise<ServicesResult>;
}
