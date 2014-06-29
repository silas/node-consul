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

Options

 * host (String, default: 127.0.0.1): agent address
 * port (String, default: 8500): agent HTTP port

``` javascript
var consul = require('consul')();
```

<a name="agent"/>
### consul.agent

 * [members](#agent-members)
 * [self](#agent-self)
 * [join](#agent-join)
 * [forceLeave](#agent-force-leave)

<a name="agent-members"/>
### consul.agent.members([options], callback)

Returns the members as seen by the consul agent.

Options

 * wan (Boolean, default: false): return WAN members instead of LAN members 

Example

``` json
[
  {
    "Name": "node1",
    "Addr": "127.0.0.1",
    "Port": 8301,
    "Tags": {
      "bootstrap": "1",
      "build": "0.3.0:441d613e",
      "dc": "dc1",
      "port": "8300",
      "role": "consul",
      "vsn": "2",
      "vsn_max": "2",
      "vsn_min": "1"
    },
    "Status": 1,
    "ProtocolMin": 1,
    "ProtocolMax": 2,
    "ProtocolCur": 2,
    "DelegateMin": 2,
    "DelegateMax": 4,
    "DelegateCur": 4
  }
]
```

<a name="agent-self"/>
### consul.agent.self(callback)

Returns the agent node configuration.

Example

``` json
{
  "Config": {
    "Bootstrap": true,
    "Server": true,
    "Datacenter": "dc1",
    "DataDir": "/var/folders/8_/068x29n92s91rsjl_zjqwgph0000gp/T/114529-6937-ptz1uw/node1/data",
    "DNSRecursor": "",
    "DNSConfig": {
      "NodeTTL": 0,
      "ServiceTTL": null,
      "AllowStale": false,
      "MaxStale": 5000000000
    },
    "Domain": "consul.",
    "LogLevel": "INFO",
    "NodeName": "node1",
    "ClientAddr": "127.0.0.1",
    "BindAddr": "127.0.0.1",
    "AdvertiseAddr": "127.0.0.1",
    "Ports": {
      "DNS": 8600,
      "HTTP": 8500,
      "RPC": 8400,
      "SerfLan": 8301,
      "SerfWan": 8302,
      "Server": 8300
    },
    "LeaveOnTerm": false,
    "SkipLeaveOnInt": false,
    "StatsiteAddr": "",
    "Protocol": 2,
    "EnableDebug": false,
    "VerifyIncoming": false,
    "VerifyOutgoing": false,
    "CAFile": "",
    "CertFile": "",
    "KeyFile": "",
    "ServerName": "",
    "StartJoin": [],
    "UiDir": "",
    "PidFile": "/var/folders/8_/068x29n92s91rsjl_zjqwgph0000gp/T/114529-6937-ptz1uw/node1/pid",
    "EnableSyslog": false,
    "SyslogFacility": "LOCAL0",
    "RejoinAfterLeave": false,
    "CheckUpdateInterval": 300000000000,
    "Revision": "441d613e1bd96254c78c46ee7c1b35c161fc7295+CHANGES",
    "Version": "0.3.0",
    "VersionPrerelease": ""
  },
  "Member": {
    "Name": "node1",
    "Addr": "127.0.0.1",
    "Port": 8301,
    "Tags": {
      "bootstrap": "1",
      "build": "0.3.0:441d613e",
      "dc": "dc1",
      "port": "8300",
      "role": "consul",
      "vsn": "2",
      "vsn_max": "2",
      "vsn_min": "1"
    },
    "Status": 1,
    "ProtocolMin": 1,
    "ProtocolMax": 2,
    "ProtocolCur": 2,
    "DelegateMin": 2,
    "DelegateMax": 4,
    "DelegateCur": 4
  }
}
```

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
