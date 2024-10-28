import { expectType } from "tsd";

import Consul from "../lib";

const consul = new Consul();

expectType<Consul>(consul);

const watchOptions: Consul.Watch.WatchOptions = {
  method: consul.kv.get,
  options: {},
};

const watch = consul.watch(watchOptions);

expectType<typeof Consul.WatchInstance>(watch);

const getResult = consul.kv.get("key");

expectType<Promise<Consul.Kv.GetResult>>(getResult);
