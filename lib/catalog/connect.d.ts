import { Consul } from "../consul";
import { NodesOptions, NodesResult } from "./service";

declare class CatalogConnect {
  constructor(consul: Consul);

  consul: Consul;

  nodes(options: NodesOptions): Promise<NodesResult>;
  nodes(service: string): Promise<NodesResult>;
}
