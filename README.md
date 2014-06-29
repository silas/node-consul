# Consul

This is a [Consul][consul] client.

 * [Documentation](#documentation)
 * [Development](#development)

## Documentation

See the official [HTTP API][consul-docs-api] docs for more information.

 * [Consul](#init)
 * [Agent](#agent)
  * [Check](#agent-check)
  * [Service](#agent-service)
 * [Catalog](#catalog)
  * [Node](#catalog-node)
  * [Service](#catalog-service)
 * [KV](#kv)
 * [Session](#session)
 * [Status](#status)

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

 * [check](#agent-check)
 * [service](#agent-service)
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
consul.agent.members(function(err, result) {
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
consul.agent.self(function(err, result) {
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
### consul.agent.join(options, callback)

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
### consul.agent.forceLeave(options, callback)

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
consul.agent.check.list(function(err, result) {
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
consul.agent.service.list(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "example": {
    "ID": "example",
    "Service": "example",
    "Tags": [
      "dev",
      "web"
    ],
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

<a name="catalog-datacenters"/>
### consul.catalog.datacenters(callback)

Lists known datacenters.

Usage

``` javascript
consul.catalog.datacenters(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  "dc1"
]
```

<a name="catalog-node"/>
### consul.catalog.node

 * [list](#catalog-node-list)
 * [services](#catalog-node-services)

<a name="catalog-node-list"/>
### consul.catalog.node.list([options], callback)

Lists nodes in a given datacenter.

Options

 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.catalog.node.list(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "Node": "node1",
    "Address": "127.0.0.1"
  }
]
```

<a name="catalog-node-services"/>
### consul.catalog.node.services(options, callback)

Lists the services provided by a node.

Options

 * node (String): node ID

Usage

``` javascript
consul.catalog.node.services('node1', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "Node": {
    "Node": "node1",
    "Address": "127.0.0.1"
  },
  "Services": {
    "consul": {
      "ID": "consul",
      "Service": "consul",
      "Tags": null,
      "Port": 8300
    },
    "example": {
      "ID": "example",
      "Service": "example",
      "Tags": [
        "dev",
        "web"
      ],
      "Port": 80
    }
  }
}
```

<a name="catalog-service"/>
### consul.catalog.service

 * [list](#catalog-service-list)
 * [nodes](#catalog-service-nodes)

<a name="catalog-service-list"/>
### consul.catalog.service.list([options], callback)

Lists services in a given datacenter.

Options

 * dc (String): datacenter (defaults to local for agent)

Usage

``` javascript
consul.catalog.service.list(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "consul": [],
  "example": [
    "dev",
    "web"
  ]
}
```

<a name="catalog-service-nodes"/>
### consul.catalog.service.nodes(options, callback)

Lists the nodes in a given service.

Options

 * service (String): service ID
 * dc (String, optional): datacenter (defaults to local for agent)
 * tag (String, optional): filter by tag

Usage

``` javascript
consul.catalog.service.nodes('example', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "Node": "node1",
    "Address": "127.0.0.1",
    "ServiceID": "example",
    "ServiceName": "example",
    "ServiceTags": [
      "dev",
      "web"
    ],
    "ServicePort": 80
  }
]
```

<a name="kv"/>
### consul.kv

 * [get](#kv-get)
 * [set](#kv-set)
 * [del](#kv-del)

<a name="kv-get"/>
### consul.kv.get(options, callback)

Return key/value (kv) pair(s).

Options

 * key (String): path to value
 * dc (String, optional): datacenter (defaults to local for agent)
 * recurse (Boolean, default: false): return all keys with given key prefix
 * index (String, optional): used with `ModifyIndex` to block and wait for changes
 * wait (String, optional): limit how long to wait for changes (ex: `5m`), used with index
 * raw (Boolean, optional): return raw value (can't be used with recursive, implies buffer)
 * buffer (Boolean, default: false): decode value into Buffer instead of String

Usage

``` javascript
consul.kv.get('hello', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "CreateIndex": 6,
  "ModifyIndex": 6,
  "LockIndex": 0,
  "Key": "hello",
  "Flags": 0,
  "Value": "world"
}
```

<a name="kv-set"/>
### consul.kv.set(options, callback)

Set key/value (kv) pair.

Options

 * key (String): key
 * value (String|Buffer): value
 * dc (String, optional): datacenter (defaults to local for agent)
 * flags (Number, optional): unsigned integer opaque to user, can be used by application
 * cas (String, optional): use with `ModifyIndex` to do a check-and-set operation
 * acquire (String, optional): session ID, lock acquisition operation
 * release (String, optional): session ID, lock release operation

Usage

``` javascript
consul.kv.set('hello', 'world', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
true
```

<a name="kv-del"/>
### consul.kv.del(options, callback)

Delete key/value (kv) pair(s).

Options

 * key (String): key
 * dc (String, optional): datacenter (defaults to local for agent)
 * recurse (Boolean, default: false): delete all keys with given key prefix

Usage

``` javascript
consul.kv.del('hello', function(err) {
  if (err) throw err;
});
```

<a name="session"/>
### consul.session

 * [create](#session-create)
 * [destroy](#session-destroy)
 * [get](#session-get)
 * [node](#session-node)
 * [list](#session-list)

<a name="session-create"/>
### consul.session.create([options], callback)

Create a new session.

Options

 * dc (String, optional): datacenter (defaults to local for agent)
 * lockdelay (String, range: 1s-60s, default: `15s`): the time consul prevents locks held by the session from being acquired after a session has been invalidated
 * name (String, optional): human readable name for the session
 * node (String, optional): node with which to associate session (defaults to connected agent)
 * checks (String[], optional): checks to associate with session

Usage

``` javascript
consul.session.create(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1"
}
```

<a name="session-destroy"/>
### consul.session.destroy(options, callback)

Destroy a given session.

Options

 * id (String): session ID
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.session.destroy('a0f5dc05-84c3-5f5a-1d88-05b875e524e1', function(err) {
  if (err) throw err;
});
```

<a name="session-get"/>
### consul.session.get(options, callback)

Queries a given session.

Options

 * id (String): session ID
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.session.get('a0f5dc05-84c3-5f5a-1d88-05b875e524e1', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "CreateIndex": 11,
  "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
  "Name": "",
  "Node": "node1",
  "Checks": [
    "serfHealth"
  ],
  "LockDelay": 15000000000
}
```

<a name="session-node"/>
### consul.session.node(options, callback)

Lists sessions belonging to a node.

Options

 * node (String): node
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.session.node('node1', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "CreateIndex": 13,
    "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
    "Name": "",
    "Node": "node1",
    "Checks": [
      "serfHealth"
    ],
    "LockDelay": 15000000000
  }
]
```

<a name="session-list"/>
### consul.session.list([options], callback)

Lists all the active sessions.

Options

 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.session.list(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "CreateIndex": 15,
    "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
    "Name": "",
    "Node": "node1",
    "Checks": [
      "serfHealth"
    ],
    "LockDelay": 15000000000
  }
]
```

<a name="status"/>
### consul.status

 * [leader](#status-leader)
 * [peers](#status-peers)

<a name="status-leader"/>
### consul.status.leader(callback)

Returns the current Raft leader.

Usage

``` javascript
consul.status.leader(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
"127.0.0.1:8300"
```

<a name="status-peers"/>
### consul.status.peers(callback)

Returns the current Raft peer set.

Usage

``` javascript
consul.status.peers(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  "127.0.0.1:8300"
]
```

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
[consul-docs-api]: http://www.consul.io/docs/agent/http.html
[download]: http://www.consul.io/downloads.html
