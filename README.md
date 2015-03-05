# Consul

This is a [Consul][consul] client.

 * [Documentation](#documentation)
 * [Development](#development)
 * [License](#license)

## Documentation

See the official [HTTP API][consul-docs-api] docs for more information.

 * [Consul](#init)
 * [ACL](#acl)
 * [Agent](#agent)
  * [Check](#agent-check)
  * [Service](#agent-service)
 * [Catalog](#catalog)
  * [Node](#catalog-node)
  * [Service](#catalog-service)
 * [Event](#event)
 * [Health](#health)
 * [KV](#kv)
 * [Session](#session)
 * [Status](#status)
 * [Watch](#watch)

<a name="callback"/>
### Callback

All callbacks have the following signature `function(err, data, res)`.

 * err (Error, optional): set if there was an error, otherwise falsy
 * data (Object, optional): response data if any, otherwise `undefined`
 * res (http.IncomingMessage, optional): HTTP response object with additional `body` property. This might not exist when `err` is set. The `body` property can be a decoded object, string, or Buffer.

<a name="common-options"/>
### Common Options

These options will be passed along with any call, although only certain endpoints support them. See the [HTTP API][consul-docs-api] for more information.

 * dc (String, optional): datacenter (defaults to local for agent)
 * wan (Boolean, default: false): return WAN members instead of LAN members
 * consistent (Boolean, default: false): require strong consistency
 * stale (Boolean, default: false): use whatever is available, can be arbitrarily stale
 * index (String, optional): used with `ModifyIndex` to block and wait for changes
 * wait (String, optional): limit how long to wait for changes (ex: `5m`), used with index
 * token (String, optional): ACL token

These options work for all endpoints.

 * ctx (EventEmitter, optional): emit `cancel` to abort request
 * timeout (Number, optional): number of milliseconds before request is aborted

<a name="init"/>
### consul([options])

Initialize a new Consul client.

Options

 * host (String, default: 127.0.0.1): agent address
 * port (String, default: 8500): agent HTTP(S) port
 * secure (Boolean, default: false): enable HTTPS
 * ca (String[], optional): array of strings or Buffers of trusted certificates in PEM format

Usage

``` javascript
var consul = require('consul')();
```

<a name="acl"/>
### consul.acl

 * [create](#acl-create)
 * [update](#acl-update)
 * [destroy](#acl-destroy)
 * [get](#acl-get)
 * [clone](#acl-clone)
 * [list](#acl-list)

<a name="acl-create"/>
### consul.acl.create([options], callback)

Creates a new token with policy.

Options

 * name (String, optional): human readable name for the token
 * type (String, enum: client, management; default: client): type of token
 * rules (String, optional): string encoded HCL or JSON

Usage

``` javascript
consul.acl.create(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "b1f4c10e-b61b-e1de-de95-218c9fefdd3e"
}
```

<a name="acl-update"/>
### consul.acl.update(options, callback)

Update the policy of a token.

Options

 * id (String): token ID
 * name (String, optional): human readable name for the token
 * type (String, enum: client, management; default: client): type of token
 * rules (String, optional): string encoded HCL or JSON

Usage

``` javascript
consul.acl.update({ id: '63e1d82e-f718-eb92-3b7d-61f0c71d45b4', name: 'test' }, function(err) {
  if (err) throw err;
});
```

<a name="acl-destroy"/>
### consul.acl.destroy(options, callback)

Destroys a given token.

Options

 * id (String): token ID

Usage

``` javascript
consul.acl.destroy('b1f4c10e-b61b-e1de-de95-218c9fefdd3e', function(err) {
  if (err) throw err;
});
```

<a name="acl-get"/>
### consul.acl.get(options, callback)

Queries the policy of a given token.

Options

 * id (String): token ID

Usage

``` javascript
consul.acl.get('63e1d82e-f718-eb92-3b7d-61f0c71d45b4', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "CreateIndex": 7,
  "ModifyIndex": 7,
  "ID": "63e1d82e-f718-eb92-3b7d-61f0c71d45b4",
  "Name": "Read only",
  "Type": "client",
  "Rules": "{\"key\":{\"\":{\"policy\":\"read\"}}}"
}
```

<a name="acl-clone"/>
### consul.acl.clone(options, callback)

Creates a new token by cloning an existing token.

Options

 * id (String): token ID

Usage

``` javascript
consul.acl.clone('63e1d82e-f718-eb92-3b7d-61f0c71d45b4', function(err) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "9fb8b20b-2636-adbb-9b99-d879df3305ec"
}
```

<a name="acl-list"/>
### consul.acl.list([options], callback)

Lists all the active tokens.

Usage

``` javascript
consul.acl.list(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "CreateIndex": 2,
    "ModifyIndex": 2,
    "ID": "anonymous",
    "Name": "Anonymous Token",
    "Type": "client",
    "Rules": ""
  }
  {
    "CreateIndex": 3,
    "ModifyIndex": 3,
    "ID": "root",
    "Name": "Master Token",
    "Type": "management",
    "Rules": ""
  }
]
```

<a name="agent"/>
### consul.agent

 * [check](#agent-check)
 * [service](#agent-service)
 * [members](#agent-members)
 * [self](#agent-self)
 * [maintenance](#agent-maintenance)
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

<a name="agent-maintenance"/>
### consul.agent.maintenance(options, callback)

Set node maintenance mode.

Options

 * enable (Boolean): maintenance mode enabled
 * reason (String, optional): human readable reason for maintenance

Usage

``` javascript
consul.agent.maintenance(true, function(err) {
  if (err) throw err;
});
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
 * serviceid (String, optional): service ID, associate check with existing service
 * http (String): url to test, 2xx passes, 429 warns, and all others fail
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
 * [maintenance](#agent-service-maintenance)

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

 * id (String): service ID

Usage

``` javascript
consul.agent.service.deregister('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-service-maintenance"/>
### consul.agent.service.maintenance(options, callback)

Set service maintenance mode.

Options

 * id (String): service ID
 * enable (Boolean): maintenance mode enabled
 * reason (String, optional): human readable reason for maintenance

Usage

``` javascript
consul.agent.service.maintenance({ id: 'example', enable: true }, function(err) {
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
      "Tags": [],
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

<a name="event"/>
### consul.event

 * [fire](#event-fire)
 * [list](#event-list)

<a name="event-fire"/>
### consul.event.fire(options, callback)

Fires a new user event.

Options

 * name (String): event name
 * payload (String|Buffer): payload
 * node (String, optional): regular expression to filter by node
 * service (String, optional): regular expression to filter by service
 * tag (String, optional): regular expression to filter by tag

Usage

``` javascript
consul.event.fire('deploy', '53', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "4730953b-3135-7ff2-47a7-9d9fc9c4e5a2",
  "Name": "deploy",
  "Payload": "53",
  "NodeFilter": "",
  "ServiceFilter": "",
  "TagFilter": "",
  "Version": 1,
  "LTime": 0
}
```

<a name="event-list"/>
### consul.event.list([options], callback)

Lists the most recent events an agent has seen.

Options

 * name (String, optional): filter by event name

Usage

``` javascript
consul.event.list('deploy', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "ID": "4730953b-3135-7ff2-47a7-9d9fc9c4e5a2",
    "Name": "deploy",
    "Payload": "53",
    "NodeFilter": "",
    "ServiceFilter": "",
    "TagFilter": "",
    "Version": 1,
    "LTime": 2
  }
]
```

<a name="health"/>
### consul.health

 * [node](#health-node)
 * [checks](#health-checks)
 * [service](#health-service)
 * [state](#health-state)

<a name="health-node"/>
### consul.health.node(options, callback)

Returns the health info of a node.

Options

 * node (String): node
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.health.node('node1', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "Node": "node1",
    "CheckID": "serfHealth",
    "Name": "Serf Health Status",
    "Status": "passing",
    "Notes": "",
    "Output": "Agent alive and reachable",
    "ServiceID": "",
    "ServiceName": ""
  },
  {
    "Node": "node1",
    "CheckID": "service:example",
    "Name": "Service 'example' check",
    "Status": "critical",
    "Notes": "",
    "Output": "",
    "ServiceID": "example",
    "ServiceName": "example"
  }
]
```

<a name="health-checks"/>
### consul.health.checks(options, callback)

Returns the checks of a service.

Options

 * service (String): service ID
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.health.checks('example', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "Node": "node1",
    "CheckID": "service:example",
    "Name": "Service 'example' check",
    "Status": "critical",
    "Notes": "",
    "Output": "",
    "ServiceID": "example",
    "ServiceName": "example"
  }
]
```

<a name="health-service"/>
### consul.health.service(options, callback)

Returns the nodes and health info of a service.

Options

 * service (String): service ID
 * dc (String, optional): datacenter (defaults to local for agent)
 * tag (String, optional): filter by tag
 * passing (Boolean, optional): restrict to passing checks

Usage

``` javascript
consul.health.service('example', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "Node": {
      "Node": "node1",
      "Address": "127.0.0.1"
    },
    "Service": {
      "ID": "example",
      "Service": "example",
      "Tags": [],
      "Port": 0
    },
    "Checks": [
      {
        "Node": "node1",
        "CheckID": "service:example",
        "Name": "Service 'example' check",
        "Status": "critical",
        "Notes": "",
        "Output": "",
        "ServiceID": "example",
        "ServiceName": "example"
      },
      {
        "Node": "node1",
        "CheckID": "serfHealth",
        "Name": "Serf Health Status",
        "Status": "passing",
        "Notes": "",
        "Output": "Agent alive and reachable",
        "ServiceID": "",
        "ServiceName": ""
      }
    ]
  }
]
```

<a name="health-state"/>
### consul.health.state(options, callback)

Returns the checks in a given state.

Options

 * state (String, enum: any, passing, warning, critical): state
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.health.state('critical', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "Node": "node1",
    "CheckID": "service:example",
    "Name": "Service 'example' check",
    "Status": "critical",
    "Notes": "",
    "Output": "",
    "ServiceID": "example",
    "ServiceName": "example"
  }
]
```

<a name="kv"/>
### consul.kv

 * [get](#kv-get)
 * [keys](#kv-keys)
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

<a name="kv-keys"/>
### consul.kv.keys(options, callback)

Return keys for a given prefix.

Options

 * key (String): path prefix
 * dc (String, optional): datacenter (defaults to local for agent)
 * separator (String, optional): list keys up to a given separator

Usage

``` javascript
consul.kv.keys('a/', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  "a/b",
  "a/c"
]
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
 * cas (String, optional): use with `ModifyIndex` to do a check-and-set operation (must be greater than `0`)

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
 * [renew](#session-renew)

<a name="session-create"/>
### consul.session.create([options], callback)

Create a new session.

Options

 * dc (String, optional): datacenter (defaults to local for agent)
 * lockdelay (String, range: 1s-60s, default: `15s`): the time consul prevents locks held by the session from being acquired after a session has been invalidated
 * name (String, optional): human readable name for the session
 * node (String, optional): node with which to associate session (defaults to connected agent)
 * checks (String[], optional): checks to associate with session
 * behavior (String, enum: release, delete; default: release): controls the behavior when a session is invalidated
 * ttl (String, optional, valid: `10s`-`3600s`): interval session must be renewed

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

<a name="session-renew"/>
### consul.session.renew(options, callback)

Renew a given session.

Options

 * id (String): session ID
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.session.renew('a0f5dc05-84c3-5f5a-1d88-05b875e524e1', function(err, renew) {
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
    "LockDelay": 15000000000,
    "Behavior": "release",
    "TTL": ""
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

<a name="watch"/>
### consul.watch(fn, opts, [callback])

Watch an endpoint for changes.

Options

 * fn (Function): method to watch
 * opts (Object): method options
 * callback (Function, optional): change/error callback

Usage

``` javascript
var watch = consul.watch(consul.kv.get, { key: 'test' });

watch.on('change', function(data, res) {
  console.log('data:', data);
});

watch.on('error', function(err) {
  console.log('error:', err);
});

setTimeout(function() { watch.end(); }, 30 * 1000);
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
