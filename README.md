# Consul

This is a [Consul][consul] client.

 * [Documentation](#documentation)
 * [Development](#development)

## Documentation

 * [Consul](#init)
 * [Agent](#agent)
   * [Check](#agent-check)
   * [Service](#agent-service)
 * [Catalog](#catalog)
 * [KV](#kv)
 * [Session](#session)

<a name="init"/>
### consul([options])

Initialize a new Consul client.

`options`

 * `host`: Consul agent address (default `127.0.0.1`)
 * `port`: Consul agent HTTP port (default `8500`)

``` javascript
var consul = require('consul')();
```

<a name="agent"/>
### consul.agent

 * [check](#agent-check)
 * [service](#agent-service)
 * [members](#agent-members)
 * [self](#agent-self)
 * [join](#agent-join)
 * [forceLeave](#agent-force-leave)

<a name="agent-check"/>
### consul.agent.check

 * [list](#agent-check-list)
 * [register](#agent-check-register)
 * [deregister](#agent-check-deregister)
 * [pass](#agent-check-pass)
 * [warn](#agent-check-warn)
 * [fail](#agent-check-fail)

<a name="agent-service"/>
### consul.agent.service

 * [list](#agent-service-list)
 * [register](#agent-service-register)
 * [deregister](#agent-service-deregister)

<a name="catalog"/>
### consul.catalog

 * [node](#catalog-node)
 * [service](#catalog-service)
 * [datacenters](#catalog-datacenters)

<a name="catalog-node"/>
### consul.catalog.node

 * [list](#catalog-node-list)
 * [services](#catalog-node-services)

<a name="catalog-service"/>
### consul.catalog.service

 * [list](#catalog-service-list)
 * [nodes](#catalog-service-nodes)

<a name="kv"/>
### consul.kv

 * [get](#kv-get)
 * [set](#kv-set)
 * [del](#kv-del)

<a name="session"/>
### consul.session

 * [create](#session-create)
 * [destroy](#session-destroy)
 * [get](#session-get)
 * [node](#session-node)
 * [list](#session-list)

## Development

 1. Install [Consul][download] into your `PATH`.
 1. Attach required IPs

    ``` console
    $ sudo ifconfig lo0 alias 127.0.0.2 up
    $ sudo ifconfig lo0 alias 127.0.0.3 up
    ```

 1. Install client dependencies

    ``` console
    $ npm install
    ```

 1. Run tests

    ``` console
    $ npm test
    ```

## License

This work is licensed under the MIT License (see the LICENSE file).

[consul]: http://www.consul.io/
[download]: http://www.consul.io/downloads.html
