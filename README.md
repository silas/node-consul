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
  * [Node](#catalog-node)
  * [Service](#catalog-service)
 * [KV](#kv)
 * [Session](#session)

<a name="init"/>
### consul([options])

Initialize a new Consul client.

Options

 * host (String, default: 127.0.0.1): agent address
 * port (String, default: 8500): agent HTTP port

Usage

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

Usage

``` javascript
consul.agent.members(function(err, members) {
  if (err) throw err;
});
```

Result

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

Usage

``` javascript
consul.agent.self(function(err, info) {
  if (err) throw err;
});
```

Result

``` json
{
  "Config": {
    "Bootstrap": true,
    "Server": true,
    "Datacenter": "dc1",
    "DataDir": "/tmp/node1/data",
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
    "PidFile": "/tmp/node1/pid",
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

<a name="agent-join"/>
### consul.agent.join([options], callback)

Trigger agent to join a node.

Options

 * address (String): node IP address to join
 * wan (Boolean, default false): attempt to join using the WAN pool

Usage

``` javascript
consul.agent.join('127.0.0.2', function(err) {
  if (err) throw err;
});
```

<a name="agent-force-leave"/>
### consul.agent.forceLeave([options], callback)

Force remove node.

Options

 * node (String): node name to remove

Usage

``` javascript
consul.agent.forceLeave('node2', function(err) {
  if (err) throw err;
});
```

<a name="agent-check"/>
### consul.agent.check

 * [list](#agent-check-list)
 * [register](#agent-check-register)
 * [deregister](#agent-check-deregister)
 * [pass](#agent-check-pass)
 * [warn](#agent-check-warn)
 * [fail](#agent-check-fail)

<a name="agent-check-list"/>
### consul.agent.check.list(callback)

Returns the checks the agent is managing.

Usage

``` javascript
consul.agent.check.list(function(err, checks) {
  if (err) throw err;
});
```

Result

``` json
{
  "example": {
    "Node": "node1",
    "CheckID": "example",
    "Name": "example",
    "Status": "passing",
    "Notes": "This is an example check.",
    "Output": "",
    "ServiceID": "",
    "ServiceName": ""
  }
}
```

<a name="agent-check-register"/>
### consul.agent.check.register(options, callback)

Registers a new check.

Options

 * name (String): check name
 * id (String, optional): check ID
 * script (String): path to check script, requires interval
 * internal (String): interval to run check, requires script (ex: `15s`)
 * ttl (String): time to live before check must be updated, instead of script and interval (ex: `60s`)
 * notes (String, optional): human readable description of check

Usage

``` javascript
var check = {
  name: 'example',
  ttl: '15s',
  notes: 'This is an example check.',
};

consul.agent.check.register(check, function(err) {
  if (err) throw err;
});
```

<a name="agent-check-deregister"/>
### consul.agent.check.deregister(options, callback)

Deregister a check.

Options

 * id (String): check ID

Usage

``` javascript
consul.agent.check.deregister('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-check-pass"/>
### consul.agent.check.pass(options, callback)

Mark a test as passing.

Options

 * id (String): check ID

Usage

``` javascript
consul.agent.check.pass('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-check-warn"/>
### consul.agent.check.warn(options, callback)

Mark a test as warning.

Options

 * id (String): check ID

Usage

``` javascript
consul.agent.check.warn('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-check-fail"/>
### consul.agent.check.fail(options, callback)

Mark a test as critical.

Options

 * id (String): check ID

Usage

``` javascript
consul.agent.check.fail('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-service"/>
### consul.agent.service

 * [list](#agent-service-list)
 * [register](#agent-service-register)
 * [deregister](#agent-service-deregister)

<a name="agent-service-list"/>
### consul.agent.service.list(callback)

Returns the services the agent is managing.

Usage

``` javascript
consul.agent.service.list(function(err, services) {
  if (err) throw err;
});
```

Result

``` json
{
  "example": {
    "ID": "example",
    "Service": "example",
    "Tags": ["web"],
    "Port": 80
  }
}
```

<a name="agent-service-register"/>
### consul.agent.service.register(options, callback)

Registers a new service.

Options

 * name (String): service name
 * id (String, optional): service ID
 * tags (String[], optional): service tags
 * check (Object, optional): service check
  * script (String): path to check script, requires interval
  * internal (String): interval to run check, requires script (ex: `15s`)
  * ttl (String): time to live before check must be updated, instead of script and interval (ex: `60s`)
  * notes (String, optional): human readable description of check

Usage

``` javascript
consul.agent.service.register('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-service-deregister"/>
### consul.agent.service.deregister(options, callback)

Deregister a service.

Options

 * id (String): check ID

Usage

``` javascript
consul.agent.service.deregister('example', function(err) {
  if (err) throw err;
});
```

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
