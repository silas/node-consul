# Consul

This is a [Consul][consul] client.

 * [Documentation](#documentation)
 * [License](#license)

## Documentation

See the official [HTTP API][consul-docs-api] docs for more information.

 * [Consul](#init)
   * [Callback](#callback)
   * [Promise](#promise)
   * [Common Method Call Options](#common-options)
 * [ACL](#acl)
 * [Agent](#agent)
   * [Check](#agent-check)
   * [Service](#agent-service)
 * [Catalog](#catalog)
   * [Connect](#catalog-connect)
   * [Node](#catalog-node)
   * [Service](#catalog-service)
 * [Event](#event)
 * [Health](#health)
 * [KV](#kv)
 * [Lock](#lock)
 * [Query](#query)
 * [Session](#session)
 * [Status](#status)
 * [Watch](#watch)

<a name="init"></a>
### consul([options])

Initialize a new Consul client.

Options

 * host (String, default: 127.0.0.1): agent address
 * port (Integer, default: 8500): agent HTTP(S) port
 * secure (Boolean, default: false): enable HTTPS
 * ca (String[], optional): array of strings or Buffers of trusted certificates in PEM format
 * defaults (Object, optional): common method call options that will be included with every call (ex: set default `token`), these options can be override on a per call basis
 * promisify (Boolean|Function, optional): convert callback methods to promises

Usage

``` javascript
var consul = require('consul')();
```

<a name="callback"></a>
### Callback

All callback methods have the following signature `function(err, data, res)`.

 * err (Error, optional): set if there was an error, otherwise falsy
 * data (Object, optional): response data if any, otherwise `undefined`
 * res (http.IncomingMessage, optional): HTTP response object with additional `body` property. This might not exist when `err` is set. The `body` property can be a decoded object, string, or Buffer.

<a name="promise"></a>
### Promise

Promise support can be enabled by setting `promisify` to `true` in Node `>= 0.12` or passing a wrapper (ex: `bluebird.fromCallback`) in older versions.

If you need access to the `res` object you can create a custom wrapper ([see example below](#promise-wrapper)).

<a name="common-options"></a>
### Common Method Call Options

These options can be included with any method call, although only certain endpoints support them. See the [HTTP API][consul-docs-api] for more information.

 * dc (String, optional): datacenter (defaults to local for agent)
 * wan (Boolean, default: false): return WAN members instead of LAN members
 * consistent (Boolean, default: false): require strong consistency
 * stale (Boolean, default: false): use whatever is available, can be arbitrarily stale
 * index (String, optional): used with `ModifyIndex` to block and wait for changes
 * wait (String, optional): limit how long to wait for changes (ex: `5m`), used with index
 * token (String, optional): ACL token
 * near (String, optional): used to sort the node list in ascending order based on the estimated round trip time from that node
 * node-meta (String[], optional): used to specify a desired node metadata key/value pair of the form key:value
 * filter (String, optional): used to [refine a data query](https://www.consul.io/api/features/filtering.html) for some API listing endpoints

These options work for all methods.

 * ctx (EventEmitter, optional): emit `cancel` to abort request
 * timeout (Number|String, optional): number of milliseconds before request is aborted (ex: `1000` or `1s`)

<a name="acl"></a>
### consul.acl

 * [bootstrap](#acl-bootstrap)
 * [create](#acl-create)
 * [update](#acl-update)
 * [destroy](#acl-destroy)
 * [get](#acl-get)
 * [clone](#acl-clone)
 * [list](#acl-list)
 * [replication](#acl-replication)

<a name="acl-bootstrap"></a>
### consul.acl.bootstrap(callback)

Creates one-time management token if not configured.

Usage

``` javascript
consul.acl.bootstrap(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "adf4238a-882b-9ddc-4a9d-5b6758e4159e"
}
```

<a name="acl-create"></a>
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

<a name="acl-update"></a>
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

<a name="acl-destroy"></a>
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

<a name="acl-get"></a>
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

<a name="acl-clone"></a>
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

<a name="acl-list"></a>
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

<a name="acl-replication"></a>
### consul.acl.replication([options], callback)

Get the status of the ACL replication process in the datacenter.

Usage

``` javascript
consul.acl.replication(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "Enabled": true,
  "Running": true,
  "SourceDatacenter": "dc1",
  "ReplicatedIndex": 1976,
  "LastSuccess": "2016-08-05T06:28:58Z",
  "LastError": "2016-08-05T06:28:28Z"
}
```

<a name="agent"></a>
### consul.agent

 * [check](#agent-check)
 * [service](#agent-service)
 * [members](#agent-members)
 * [reload](#agent-reload)
 * [self](#agent-self)
 * [maintenance](#agent-maintenance)
 * [join](#agent-join)
 * [forceLeave](#agent-force-leave)

<a name="agent-members"></a>
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

<a name="agent-reload"></a>
### consul.agent.reload([options], callback)

Reload agent configuration.

Usage

``` javascript
consul.agent.reload(function(err, result) {
  if (err) throw err;
});
```

<a name="agent-self"></a>
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

<a name="agent-maintenance"></a>
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

<a name="agent-join"></a>
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

<a name="agent-force-leave"></a>
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

<a name="agent-check"></a>
### consul.agent.check

 * [list](#agent-check-list)
 * [register](#agent-check-register)
 * [deregister](#agent-check-deregister)
 * [pass](#agent-check-pass)
 * [warn](#agent-check-warn)
 * [fail](#agent-check-fail)

<a name="agent-check-list"></a>
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

<a name="agent-check-register"></a>
### consul.agent.check.register(options, callback)

Registers a new check.

Options

 * name (String): check name
 * id (String, optional): check ID
 * serviceid (String, optional): service ID, associate check with existing service
 * http (String): url to test, 2xx passes, 429 warns, and all others fail
 * tlsskipverify (Boolean, default: false): skip HTTPS verification
 * tcp (String): host:port to test, passes if connection is established, fails otherwise
 * args (String[]): path to check script, requires interval
 * script (String): path to check script, requires interval (DEPRECATED)
 * dockercontainerid (String, optional): Docker container ID to run script
 * grpc (String, optional): gRPC endpoint (ex: `127.0.0.1:12345`)
 * grpcusetls (Boolean, optional): enable TLS for gRPC check
 * shell (String, optional): shell in which to run script (currently only supported with Docker)
 * interval (String): interval to run check, requires script (ex: `15s`)
 * timeout (String, optional): timeout for the check (ex: `10s`)
 * ttl (String): time to live before check must be updated (ex: `60s`)
 * aliasnode (String): ID of a node for an alias check (ex: `web1`)
 * aliasservice (String): ID of a service for an alias check (ex: `web`)
 * notes (String, optional): human readable description of check
 * status (String, optional): initial service status
 * deregistercriticalserviceafter (String, optional, Consul 0.7+): timeout after
 which to automatically deregister service if check remains in critical state

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

<a name="agent-check-deregister"></a>
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

<a name="agent-check-pass"></a>
### consul.agent.check.pass(options, callback)

Mark a test as passing.

Options

 * id (String): check ID
 * note (String, optional): human readable message

Usage

``` javascript
consul.agent.check.pass('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-check-warn"></a>
### consul.agent.check.warn(options, callback)

Mark a test as warning.

Options

 * id (String): check ID
 * note (String, optional): human readable message

Usage

``` javascript
consul.agent.check.warn('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-check-fail"></a>
### consul.agent.check.fail(options, callback)

Mark a test as critical.

Options

 * id (String): check ID
 * note (String, optional): human readable message

Usage

``` javascript
consul.agent.check.fail('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-service"></a>
### consul.agent.service

 * [list](#agent-service-list)
 * [register](#agent-service-register)
 * [deregister](#agent-service-deregister)
 * [maintenance](#agent-service-maintenance)

<a name="agent-service-list"></a>
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

<a name="agent-service-register"></a>
### consul.agent.service.register(options, callback)

Registers a new service.

Options

 * name (String): service name
 * id (String, optional): service ID
 * tags (String[], optional): service tags
 * address (String, optional): service IP address
 * port (Integer, optional): service port
 * meta (Object, optional): metadata linked to the service instance
 * check (Object, optional): service check
   * http (String): URL endpoint, requires interval
   * tcp (String): host:port to test, passes if connection is established, fails otherwise
   * script (String): path to check script, requires interval
   * dockercontainerid (String, optional): Docker container ID to run script
   * shell (String, optional): shell in which to run script (currently only supported with Docker)
   * interval (String): interval to run check, requires script (ex: `15s`)
   * timeout (String, optional): timeout for the check (ex: `10s`)
   * ttl (String): time to live before check must be updated, instead of http/tcp/script and interval (ex: `60s`)
   * notes (String, optional): human readable description of check
   * status (String, optional): initial service status
   * deregistercriticalserviceafter (String, optional, Consul 0.7+): timeout after
   which to automatically deregister service if check remains in critical state
 * checks (Object[], optional): service checks (see `check` above)
 * connect (Object, optional): specifies the [configuration](https://www.consul.io/api/agent/service.html#connect-structure) for Connect
 * proxy (Object, optional): specifies the [configuration](https://www.consul.io/docs/connect/registration/service-registration.html) for a Connect proxy instance

Usage

``` javascript
consul.agent.service.register('example', function(err) {
  if (err) throw err;
});
```

<a name="agent-service-deregister"></a>
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

<a name="agent-service-maintenance"></a>
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

<a name="catalog"></a>
### consul.catalog

 * [datacenters](#catalog-datacenters)
 * [connect](#catalog-connect)
 * [node](#catalog-node)
 * [service](#catalog-service)

<a name="catalog-datacenters"></a>
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

<a name="catalog-connect"></a>
### consul.catalog.connect

 * [nodes](#catalog-connect-nodes)

<a name="catalog-connect-nodes"></a>
### consul.catalog.connect.nodes(options, callback)

Lists the nodes for a given Connect-capable service.

Options

 * service (String): service name
 * dc (String, optional): datacenter (defaults to local for agent)

Usage

``` javascript
consul.catalog.connect.nodes('example', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "ID": "40e4a748-2192-161a-0510-9bf59fe950b5",
    "Node": "foobar",
    "Address": "192.168.10.10",
    "Datacenter": "dc1",
    "TaggedAddresses": {
      "lan": "192.168.10.10",
      "wan": "10.0.10.10"
    },
    "NodeMeta": {
      "somekey": "somevalue"
    },
    "CreateIndex": 51,
    "ModifyIndex": 51,
    "ServiceAddress": "172.17.0.3",
    "ServiceEnableTagOverride": false,
    "ServiceID": "32a2a47f7992:nodea:5000",
    "ServiceName": "foobar",
    "ServiceKind": "connect-proxy",
    "ServiceProxyDestination": "my-service",
    "ServicePort": 5000,
    "ServiceMeta": {
        "foobar_meta_value": "baz"
    },
    "ServiceTags": [
      "tacos"
    ]
  }
]
```

<a name="catalog-node"></a>
### consul.catalog.node

 * [list](#catalog-node-list)
 * [services](#catalog-node-services)

<a name="catalog-node-list"></a>
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

<a name="catalog-node-services"></a>
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

<a name="catalog-service"></a>
### consul.catalog.service

 * [list](#catalog-service-list)
 * [nodes](#catalog-service-nodes)

<a name="catalog-service-list"></a>
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

<a name="catalog-service-nodes"></a>
### consul.catalog.service.nodes(options, callback)

Lists the nodes for a given service.

Options

 * service (String): service name
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

<a name="event"></a>
### consul.event

 * [fire](#event-fire)
 * [list](#event-list)

<a name="event-fire"></a>
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

<a name="event-list"></a>
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

<a name="health"></a>
### consul.health

 * [node](#health-node)
 * [checks](#health-checks)
 * [service](#health-service)
 * [state](#health-state)

<a name="health-node"></a>
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

<a name="health-checks"></a>
### consul.health.checks(options, callback)

Returns the checks of a service.

Options

 * service (String): service name
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

<a name="health-service"></a>
### consul.health.service(options, callback)

Returns the nodes and health info of a service.

Options

 * service (String): service name
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

<a name="health-state"></a>
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

<a name="kv"></a>
### consul.kv

 * [get](#kv-get)
 * [keys](#kv-keys)
 * [set](#kv-set)
 * [del](#kv-del)

<a name="kv-get"></a>
### consul.kv.get(options, callback)

Return key/value (kv) pair(s) or `undefined` if key not found.

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
  if (result === undefined) throw new Error('key not found');
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

<a name="kv-keys"></a>
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

<a name="kv-set"></a>
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

<a name="kv-del"></a>
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

<a name="lock"></a>
### consul.lock(options)

_Experimental_

Lock a key using the method described in the [leader election](https://www.consul.io/docs/guides/leader-election.html) guide.

Options

 * key (String): lock key
 * value (String|Buffer, optional): lock value
 * session (Object|String, optional): session options

Events

 * `acquire`: lock successfully acquired
 * `error`: lock related error
 * `retry`: lock retry attempt
 * `release`: lock gracefully released (not always emitted)
 * `end`: lock ended (always emitted)

Usage

``` javascript
var lock = consul.lock({ key: 'test' });

lock.on('acquire', function() {
  console.log('lock acquired');

  lock.release();
});

lock.on('release', function() {
  console.log('lock released');
});

lock.on('error', function() {
  console.log('lock error:', err);
});

lock.on('end', function(err) {
  console.log('lock released or there was a permanent failure');
});

lock.acquire();
```

Result

```
lock acquired
lock released
lock released or there was a permanent failure
```

<a name="query"></a>
### consul.query

 * [list](#query-list)
 * [create](#query-create)
 * [update](#query-update)
 * [get](#query-get)
 * [destroy](#query-destroy)
 * [execute](#query-execute)
 * [explain](#query-explain)

<a name="query-list"></a>
### consul.query.list(callback)

List prepared query.

Usage

``` javascript
consul.query.list(function(err, result) {
  if (err) throw err;
});
```

Result

``` json
[
  {
    "ID": "422b14b9-874b-4520-bd2e-e149a42b0066",
    "Name": "redis",
    "Session": "",
    "Token": "",
    "Template": {
      "Type": "",
      "Regexp":""
    },
    "Service": {
      "Service": "redis",
      "Failover": {
        "NearestN": 3,
        "Datacenters": [
          "dc1",
          "dc2"
        ]
      },
      "OnlyPassing": false,
      "Tags": [
        "master",
        "!experimental"
      ]
    },
    "DNS": {
      "TTL": "10s"
    },
    "RaftIndex": {
      "CreateIndex": 23,
      "ModifyIndex": 42
    }
  }
]
```

<a name="query-create"></a>
### consul.query.create(options, callback)

Create a new prepared query.

Options

 * name (String, optional): name that can be used to execute a query instead of using its ID
 * session (String, optional): provides a way to automatically remove a prepared query when the given session is invalidated
 * token (String, optional): captured ACL Token that is reused as the ACL Token every time the query is executed
 * near (String, optional): allows specifying a particular node to sort near based on distance sorting using Network Coordinates
 * service.service (String, required): name of the service to query
 * service.failover.nearestn (Number, optional): when set the query will be forwarded to up to nearest N other datacenters based on their estimated network round trip time using Network Coordinates from the WAN gossip pool
 * service.failover.datacenters (String[], optional): fixed list of remote datacenters to forward the query to if there are no healthy nodes in the local datacenter
 * service.onlypassing (Boolean, default: false): filter results to only nodes with a passing state
 * service.tags (String[], optional): list of service tags to filter the query results
 * ttl.dns (String, optional, ex: `10s`): controls how the TTL is set when query results are served over DNS

Usage

``` javascript
var opts = {
  name: 'redis',
  service: {
    service: 'redis'
    onlypassing: true
  },
};

consul.query.create(opts, function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "422b14b9-874b-4520-bd2e-e149a42b0066"
}
```

<a name="query-update"></a>
### consul.query.update(options, callback)

Update existing prepared query.

Options

 * query (String, required): ID of the query

And all [create options][query-create].

Usage

``` javascript
var opts = {
  query: '422b14b9-874b-4520-bd2e-e149a42b0066',
  name: 'redis',
  service: {
    service: 'redis'
    onlypassing: false
  },
};

consul.query.update(opts, function(err, result) {
  if (err) throw err;
});
```

<a name="query-get"></a>
### consul.query.get(options, callback)

Get prepared query.

Options

 * query (String, required): ID of the query

Usage

``` javascript
consul.query.get('6119cabf-c052-48fe-9f07-711762e52931', function(err, result) {
  if (err) throw err;
});
```

Result

``` json
{
  "ID": "6119cabf-c052-48fe-9f07-711762e52931",
  "Name": "redis",
  "Session": "",
  "Token": "",
  "Template": {
    "Type": "",
    "Regexp":""
  },
  "Service": {
    "Service": "redis",
    "Failover": {
      "NearestN": 3,
      "Datacenters": [
        "dc1",
        "dc2"
      ]
    },
    "OnlyPassing": false,
    "Tags": [
      "master",
      "!experimental"
    ]
  },
  "DNS": {
    "TTL": "10s"
  },
  "RaftIndex": {
    "CreateIndex": 23,
    "ModifyIndex": 42
  }
}
```


<a name="query-destroy"></a>
### consul.query.destroy(options, callback)

Delete prepared query.

Options

 * query (String, required): ID of the query

Usage

``` javascript
consul.query.destroy('422b14b9-874b-4520-bd2e-e149a42b0066', function(err) {
  if (err) throw err;
});
```

<a name="query-execute"></a>
### consul.query.execute(options, callback)

Execute prepared query.

Options

 * query (String, required): ID of the query

Usage

``` javascript
consul.query.execute('6119cabf-c052-48fe-9f07-711762e52931', function(err) {
  if (err) throw err;
});
```

Result

``` json
{
  "Service": "redis",
  "Nodes": [
    {
      "Node": {
        "Node": "foobar",
        "Address": "10.1.10.12",
        "TaggedAddresses": {
          "lan": "10.1.10.12",
          "wan": "10.1.10.12"
        }
      },
      "Service": {
        "ID": "redis",
        "Service": "redis",
        "Tags": null,
        "Port": 8000
      },
      "Checks": [
        {
          "Node": "foobar",
          "CheckID": "service:redis",
          "Name": "Service 'redis' check",
          "Status": "passing",
          "Notes": "",
          "Output": "",
          "ServiceID": "redis",
          "ServiceName": "redis"
        },
        {
          "Node": "foobar",
          "CheckID": "serfHealth",
          "Name": "Serf Health Status",
          "Status": "passing",
          "Notes": "",
          "Output": "",
          "ServiceID": "",
          "ServiceName": ""
        }
      ],
      "DNS": {
        "TTL": "10s"
      },
      "Datacenter": "dc3",
      "Failovers": 2
    }
  ]
}
```

<a name="query-explain"></a>
### consul.query.explain(options, callback)

Explain prepared query.

Options

 * query (String, required): ID of the query

Usage

``` javascript
consul.query.explain('422b14b9-874b-4520-bd2e-e149a42b0066', function(err, result) {
  if (err) throw err;
  console.log(result);
});
```

Result

``` json
{
  "Query": {
    "ID": "422b14b9-874b-4520-bd2e-e149a42b0066",
    "Name": "redis",
    "Session": "",
    "Token": "",
    "Template": {
      "Type": "",
      "Regexp":""
    },
    "Service": {
      "Service": "redis",
      "Failover": {
        "NearestN": 3,
        "Datacenters": [
          "dc1",
          "dc2"
        ]
      },
      "OnlyPassing": false,
      "Tags": [
        "master",
        "!experimental"
      ]
    },
    "DNS": {
      "TTL": "10s"
    },
    "RaftIndex": {
      "CreateIndex": 23,
      "ModifyIndex": 42
    }
  }
}
```

<a name="session"></a>
### consul.session

 * [create](#session-create)
 * [destroy](#session-destroy)
 * [get](#session-get)
 * [node](#session-node)
 * [list](#session-list)
 * [renew](#session-renew)

<a name="session-create"></a>
### consul.session.create([options], callback)

Create a new session.

Options

 * dc (String, optional): datacenter (defaults to local for agent)
 * lockdelay (String, range: 1s-60s, default: `15s`): the time consul prevents locks held by the session from being acquired after a session has been invalidated
 * name (String, optional): human readable name for the session
 * node (String, optional): node with which to associate session (defaults to connected agent)
 * checks (String[], optional): checks to associate with session
 * behavior (String, enum: release, delete; default: release): controls the behavior when a session is invalidated
 * ttl (String, optional, valid: `10s`-`86400s`): interval session must be renewed

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

<a name="session-destroy"></a>
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

<a name="session-get"></a>
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

<a name="session-node"></a>
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

<a name="session-list"></a>
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

<a name="session-renew"></a>
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

<a name="status"></a>
### consul.status

 * [leader](#status-leader)
 * [peers](#status-peers)

<a name="status-leader"></a>
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

<a name="status-peers"></a>
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

<a name="watch"></a>
### consul.watch(options)

Watch an endpoint for changes.

The watch relies on blocking queries, adding the `index` and `wait` parameters as per [Consul's documentation](https://www.consul.io/docs/agent/http.html)

If a blocking query is dropped due to a Consul crash or disconnect, watch will attempt to reinitiate the blocking query with logarithmic backoff.

Upon reconnect, unlike the first call to watch() in which the latest `x-consul-index` is unknown, the last known `x-consul-index` will be reused, thus not emitting the `change` event unless it has been incremented since.

NOTE: If you specify an alternative options.timeout keep in mind that a small random amount of additional wait is added to all requests (wait / 16). The default timeout is currently set to (wait + wait * 0.1), you should use something similar to avoid issues.

Options

 * method (Function): method to watch
 * options (Object): method options
 * backoffFactor (Integer, default: 100): backoff factor in milliseconds to apply between attempts (`backoffFactor * (2 ^ retry attempt)`)
 * backoffMax (Integer, default: 30000): maximum backoff time in milliseconds to wait between attempts
 * maxAttempts (Integer): maximum number of retry attempts to make before giving up

Usage

``` javascript
var watch = consul.watch({
  method: consul.kv.get,
  options: { key: 'test' },
  backoffFactor: 1000,
});

watch.on('change', function(data, res) {
  console.log('data:', data);
});

watch.on('error', function(err) {
  console.log('error:', err);
});

setTimeout(function() { watch.end(); }, 30 * 1000);
```

<a name="promise-wrapper"></a>
### Promise Wrapper

``` javascript
var Bluebird = require('bluebird');

function fromCallback(fn) {
  return new Bluebird(function(resolve, reject) {
    try {
      return fn(function(err, data, res) {
        if (err) {
          err.res = res;
          return reject(err);
        }
        return resolve([data, res]);
      });
    } catch (err) {
      return reject(err);
    }
  });
}

var consul = require('consul')({ promisify: fromCallback });

consul.kv.set('test', 'hello world').then(function() {
  consul.kv.keys().spread(function(data, res) {
    console.log('data:', data);
    console.log('headers:', res.headers);
  });
});
```

## Acceptance Tests

 1. Install [Consul][download] into your `PATH`

    ``` console
    $ brew install consul
    ```

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
    $ npm run acceptance
    ```

## License

This work is licensed under the MIT License (see the LICENSE file).

Parts of the Documentation were copied from the official
[Consul website][consul-docs-api], see the NOTICE file for license
information.

[consul]: http://www.consul.io/
[consul-docs-api]: http://www.consul.io/docs/agent/http.html
[download]: http://www.consul.io/downloads.html
