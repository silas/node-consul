import {Consul} from "./consul";

interface FireOptions {
  name: string;
  payload: string | Buffer;
  dc?: string;
  node?: string;
  service?: string;
  tag?: string;
}

interface FireResult {
  ID: string;
  Name: string;
  Payload: string;
  NodeFilter: string;
  ServiceFilter: string;
  TagFilter: string;
  Version: number;
  LTime: number;
}

interface ListOptions {
  name?: string;
  node?: string;
  service?: string;
  tag?: string;
}

type ListResult = FireResult[];

declare class Event {
  constructor(consul: Consul);

  consul: Consul;

  fire(name: string): Promise<FireResult>;
  fire(name: string, payload: string | Buffer): Promise<FireResult>;
  fire(options: FireOptions): Promise<FireResult>;

  list(options?: ListOptions): Promise<ListResult>;
  list(name: string): Promise<ListResult>;
}
