import { Consul } from "../consul";

interface CreateOptions {
  name?: string;
  type?: "client" | "management";
  rules?: string;
}

type CreateResult = any;

interface UpdateOptions {
  id: string;
  name?: string;
  type?: "client" | "management";
  rules?: string;
}

type UpdateResult = any;

interface DestroyOptions {
  id: string;
}

type DestroyResult = any;

interface InfoOptions {
  id: string;
}

interface InfoResult {
  CreateIndex: number;
  ModifyIndex: number;
  ID: string;
  Name: string;
  Type: "client" | "management";
  Rules: string;
}

type GetOptions = InfoOptions;

type GetResult = InfoResult;

interface CloneOptions {
  id: string;
}

type CloneResult = any;

interface ListOptions {}

type ListResult = GetResult[];

declare class AclLegacy {
  constructor(consul: Consul);

  consul: Consul;

  create(options?: CreateOptions): Promise<CreateResult>;

  update(options: UpdateOptions): Promise<UpdateResult>;

  destroy(options: DestroyOptions): Promise<DestroyResult>;
  destroy(id: string): Promise<DestroyResult>;

  info(options: InfoOptions): Promise<InfoResult>;
  info(id: string): Promise<InfoResult>;

  get(options: GetOptions): Promise<GetResult>;
  get(id: string): Promise<GetResult>;

  clone(options: CloneOptions): Promise<CloneResult>;
  clone(id: string): Promise<CloneResult>;

  list(options?: ListOptions): Promise<ListResult>;
}
