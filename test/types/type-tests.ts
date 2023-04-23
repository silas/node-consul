import Consul from "consul";

const consul = new Consul();

// @ts-expect-error
consul.expectError();
