import {Consul} from "../consul";

interface ListOptions {
  dc?: string;
  near?: string;
  filter?: string;
}

type ListResult = any[];

interface ServicesOptions {
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
