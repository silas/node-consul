import { expectType } from "tsd";

import Consul from "../lib";

const consul = new Consul();

expectType<Consul>(consul);
