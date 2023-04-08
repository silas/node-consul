import {Consul} from "./consul";

interface GetOptions {
  key?: string;
  dc?: string;
  recurse?: boolean;
  raw?: boolean;
  keys?: boolean;
  separator?: boolean;
  ns?: string;
}

interface GetResult {
  CreateIndex: number;
  ModifyIndex: number;
  LockIndex: number;
  Key: string;
  Flags: number;
  Value: string;
}

type KeysOptions = GetOptions;

type KeysResult = string[];

interface SetOptions {
  key?: string;
  value: string | Buffer;
  dc?: string;
  flags?: number;
  cas?: number;
  acquire?: string;
  release?: string;
  ns?: string;
}

type SetResult = boolean;

interface DelOptions {
  key?: string;
  dc?: string;
  recurse?: boolean;
  cas?: number;
  ns?: string;
}

type DelResult = boolean;

declare class Kv {
  constructor(consul: Consul);

  consul: Consul;

  get(options?: GetOptions): Promise<GetResult>;
  get(key: string): Promise<GetResult>;

  keys(options?: KeysOptions): Promise<KeysResult>;
  keys(key: string): Promise<KeysResult>;

  set(options: SetOptions): Promise<SetResult>;
  set(key: string, value: string | Buffer): Promise<SetResult>;
  set(key: string, value: string | Buffer, options: SetOptions): Promise<SetResult>;

  del(options: DelOptions): Promise<DelResult>;
  del(key: string): Promise<DelResult>;
}
