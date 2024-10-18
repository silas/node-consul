# Consul

This is a [Consul][consul] client.

- [Documentation](#documentation)
- [License](#license)

## Documentation

See the official [HTTP API][consul-docs-api] docs for more information.

- [Consul](#init)
  - [Common Method Call Options](#common-options)

* [ACL](#acl)
  - [Legacy](#acl-legacy)
* [Agent](#agent)
  - [Check](#agent-check)
  - [Service](#agent-service)
* [Catalog](#catalog)
  - [Connect](#catalog-connect)
  - [Node](#catalog-node)
  - [Service](#catalog-service)
* [Event](#event)
* [Health](#health)
* [KV](#kv)
* [Query](#query)
* [Session](#session)
* [Status](#status)
* [Transaction](#transaction)
* [Watch](#watch)

<a id="init"></a>

### Consul([options])

Initialize a new Consul client.

Options

- host (String, default: 127.0.0.1): agent address
- port (Integer, default: 8500): agent HTTP(S) port
- secure (Boolean, default: false): enable HTTPS
- defaults (Object, optional): common method call options that will be included with every call (ex: set default `token`), these options can be override on a per call basis

Advanced options

- agent (http.Agent|https.Agent, optionals): if not set uses the global agent
- baseUrl, headers, tags, socketPath, and timeout (see [Papi](https://github.com/silas/node-papi/blob/main/README.md#client) for details)
- tls options: ca, cert, ciphers, clientCertEngine, crl, dhparam, ecdhCurve, honorCipherOrder, key, passphrase, pfx, rejectUnauthorized, secureOptions, secureProtocol, servername, and sessionIdContext (see [Node.js docs](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_connect_options_callback) for details)

Usage

```javascript
import Consul from "consul";

const consul = new Consul();
```

<a id="common-options"></a>

### Common Method Call Options

These options can be included with any method call, although only certain endpoints support them. See the [HTTP API][consul-docs-api] for more information.

- dc (String, optional): datacenter (defaults to local for agent)
- partition (String, optional): partition (defaults to 'default' partition)
- wan (Boolean, default: false): return WAN members instead of LAN members
- consistent (Boolean, default: false): require strong consistency
- stale (Boolean, default: false): use whatever is available, can be arbitrarily stale
- index (String, optional): used with `ModifyIndex` to block and wait for changes
- wait (String, optional): limit how long to wait for changes (ex: `5m`), used with index
- token (String, optional): ACL token
- near (String, optional): used to sort the node list in ascending order based on the estimated round trip time from that node
- node-meta (String[], optional): used to specify a desired node metadata key/value pair of the form key:value
- filter (String, optional): used to [refine a data query](https://www.consul.io/api/features/filtering.html) for some API listing endpoints

These options work for all methods.

- ctx (EventEmitter, optional): emit `cancel` to abort request
- timeout (Number|String, optional): number of milliseconds before request is aborted (ex: `1000` or `1s`)

<a id="acl"></a>

### consul.acl

- [bootstrap](#acl-bootstrap)
- [legacy](#acl-legacy)
- [replication](#acl-replication)

<a id="acl-bootstrap"></a>

### consul.acl.bootstrap()

Creates one-time management token if not configured.

Usage

```javascript
await consul.acl.bootstrap();
```

Result

```json
{
  "ID": "adf4238a-882b-9ddc-4a9d-5b6758e4159e"
}
```

<a id="acl-replication"></a>

### consul.acl.replication([options])

Get the status of the ACL replication process in the datacenter.

Usage

```javascript
await consul.acl.replication();
```

Result

```json
{
  "Enabled": true,
  "Running": true,
  "SourceDatacenter": "dc1",
  "ReplicatedIndex": 1976,
  "LastSuccess": "2016-08-05T06:28:58Z",
  "LastError": "2016-08-05T06:28:28Z"
}
```

<a id="acl-legacy"></a>

### consul.acl.legacy

- [create](#acl-legacy-create)
- [update](#acl-legacy-update)
- [destroy](#acl-legacy-destroy)
- [get](#acl-legacy-get)
- [clone](#acl-legacy-clone)
- [list](#acl-legacy-list)

<a id="acl-legacy-create"></a>

### consul.acl.legacy.create([options])

Creates a new token with policy.

Options

- name (String, optional): human readable name for the token
- type (String, enum: client, management; default: client): type of token
- rules (String, optional): string encoded HCL or JSON

Usage

```javascript
await consul.acl.legacy.create();
```

Result

```json
{
  "ID": "b1f4c10e-b61b-e1de-de95-218c9fefdd3e"
}
```

<a id="acl-legacy-update"></a>

### consul.acl.legacy.update(options)

Update the policy of a token.

Options

- id (String): token ID
- name (String, optional): human readable name for the token
- type (String, enum: client, management; default: client): type of token
- rules (String, optional): string encoded HCL or JSON

Usage

```javascript
await consul.acl.legacy.update({
  id: "63e1d82e-f718-eb92-3b7d-61f0c71d45b4",
  name: "test",
});
```

<a id="acl-legacy-destroy"></a>

### consul.acl.legacy.destroy(options)

Destroys a given token.

Options

- id (String): token ID

Usage

```javascript
await consul.acl.legacy.destroy("b1f4c10e-b61b-e1de-de95-218c9fefdd3e");
```

<a id="acl-legacy-get"></a>

### consul.acl.legacy.get(options)

Queries the policy of a given token.

Options

- id (String): token ID

Usage

```javascript
await consul.acl.legacy.get("63e1d82e-f718-eb92-3b7d-61f0c71d45b4");
```

Result

```json
{
  "CreateIndex": 7,
  "ModifyIndex": 7,
  "ID": "63e1d82e-f718-eb92-3b7d-61f0c71d45b4",
  "Name": "Read only",
  "Type": "client",
  "Rules": "{\"key\":{\"\":{\"policy\":\"read\"}}}"
}
```

<a id="acl-legacy-clone"></a>

### consul.acl.legacy.clone(options)

Creates a new token by cloning an existing token.

Options

- id (String): token ID

Usage

```javascript
await consul.acl.legacy.clone("63e1d82e-f718-eb92-3b7d-61f0c71d45b4");
```

Result

```json
{
  "ID": "9fb8b20b-2636-adbb-9b99-d879df3305ec"
}
```

<a id="acl-legacy-list"></a>

### consul.acl.legacy.list([options])

Lists all the active tokens.

Usage

```javascript
await consul.acl.legacy.list();
```

Result

```json
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

<a id="agent"></a>

### consul.agent

- [check](#agent-check)
- [service](#agent-service)
- [members](#agent-members)
- [reload](#agent-reload)
- [self](#agent-self)
- [maintenance](#agent-maintenance)
- [join](#agent-join)
- [forceLeave](#agent-force-leave)

<a id="agent-members"></a>

### consul.agent.members([options])

Returns the members as seen by the consul agent.

Options

- wan (Boolean, default: false): return WAN members instead of LAN members

Usage

```javascript
await consul.agent.members();
```

Result

```json
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

<a id="agent-reload"></a>

### consul.agent.reload([options])

Reload agent configuration.

Usage

```javascript
await consul.agent.reload();
```

<a id="agent-self"></a>

### consul.agent.self()

Returns the agent node configuration.

Usage

```javascript
await consul.agent.self();
```

Result

```json
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

<a id="agent-maintenance"></a>

### consul.agent.maintenance(options)

Set node maintenance mode.

Options

- enable (Boolean): maintenance mode enabled
- reason (String, optional): human readable reason for maintenance

Usage

```javascript
await consul.agent.maintenance(true);
```

<a id="agent-join"></a>

### consul.agent.join(options)

Trigger agent to join a node.

Options

- address (String): node IP address to join
- wan (Boolean, default false): attempt to join using the WAN pool

Usage

```javascript
await consul.agent.join("127.0.0.2");
```

<a id="agent-force-leave"></a>

### consul.agent.forceLeave(options)

Force remove node.

Options

- node (String): node name to remove

Usage

```javascript
await consul.agent.forceLeave("node2");
```

<a id="agent-check"></a>

### consul.agent.check

- [list](#agent-check-list)
- [register](#agent-check-register)
- [deregister](#agent-check-deregister)
- [pass](#agent-check-pass)
- [warn](#agent-check-warn)
- [fail](#agent-check-fail)

<a id="agent-check-list"></a>

### consul.agent.check.list()

Returns the checks the agent is managing.

Usage

```javascript
await consul.agent.check.list();
```

Result

```json
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

<a id="agent-check-register"></a>

### consul.agent.check.register(options)

Registers a new check.

Options

- name (String): check name
- id (String, optional): check ID
- serviceid (String, optional): service ID, associate check with existing service
- http (String): url to test, 2xx passes, 429 warns, and all others fail
- tlsskipverify (Boolean, default: false): skip HTTPS verification
- tcp (String): host:port to test, passes if connection is established, fails otherwise
- args (String[]): path to check script, requires interval
- script (String): path to check script, requires interval (DEPRECATED)
- dockercontainerid (String, optional): Docker container ID to run script
- grpc (String, optional): gRPC endpoint (ex: `127.0.0.1:12345`)
- grpcusetls (Boolean, optional): enable TLS for gRPC check
- shell (String, optional): shell in which to run script (currently only supported with Docker)
- interval (String): interval to run check, requires script (ex: `15s`)
- timeout (String, optional): timeout for the check (ex: `10s`)
- ttl (String): time to live before check must be updated (ex: `60s`)
- aliasnode (String): ID of a node for an alias check (ex: `web1`)
- aliasservice (String): ID of a service for an alias check (ex: `web`)
- notes (String, optional): human readable description of check
- status (String, optional): initial service status
- deregistercriticalserviceafter (String, optional, Consul 0.7+): timeout after
  which to automatically deregister service if check remains in critical state
- successbeforepassing (Number, optional): number of consecutive successful
  results required before check status transitions to passing
- failuresbeforecritical (Number, optional): number of consecutive unsuccessful
  results required before check status transitions to critical

Usage

```javascript
await consul.agent.check.register({
  name: "example",
  ttl: "15s",
  notes: "This is an example check.",
});
```

<a id="agent-check-deregister"></a>

### consul.agent.check.deregister(options)

Deregister a check.

Options

- id (String): check ID

Usage

```javascript
await consul.agent.check.deregister("example");
```

<a id="agent-check-pass"></a>

### consul.agent.check.pass(options)

Mark a test as passing.

Options

- id (String): check ID
- note (String, optional): human readable message

Usage

```javascript
await consul.agent.check.pass("example");
```

<a id="agent-check-warn"></a>

### consul.agent.check.warn(options)

Mark a test as warning.

Options

- id (String): check ID
- note (String, optional): human readable message

Usage

```javascript
await consul.agent.check.warn("example");
```

<a id="agent-check-fail"></a>

### consul.agent.check.fail(options)

Mark a test as critical.

Options

- id (String): check ID
- note (String, optional): human readable message

Usage

```javascript
await consul.agent.check.fail("example");
```

<a id="agent-service"></a>

### consul.agent.service

- [list](#agent-service-list)
- [register](#agent-service-register)
- [deregister](#agent-service-deregister)
- [maintenance](#agent-service-maintenance)

<a id="agent-service-list"></a>

### consul.agent.service.list()

Returns the services the agent is managing.

Usage

```javascript
await consul.agent.service.list();
```

Result

```json
{
  "example": {
    "ID": "example",
    "Service": "example",
    "Tags": ["dev", "web"],
    "Port": 80
  }
}
```

<a id="agent-service-register"></a>

### consul.agent.service.register(options)

Registers a new service.

Options

- name (String): service name
- id (String, optional): service ID
- tags (String[], optional): service tags
- address (String, optional): service IP address
- port (Integer, optional): service port
- meta (Object, optional): metadata linked to the service instance
- check (Object, optional): service check
  - http (String): URL endpoint, requires interval
  - tcp (String): host:port to test, passes if connection is established, fails otherwise
  - script (String): path to check script, requires interval
  - dockercontainerid (String, optional): Docker container ID to run script
  - shell (String, optional): shell in which to run script (currently only supported with Docker)
  - interval (String): interval to run check, requires script (ex: `15s`)
  - timeout (String, optional): timeout for the check (ex: `10s`)
  - ttl (String): time to live before check must be updated, instead of http/tcp/script and interval (ex: `60s`)
  - notes (String, optional): human readable description of check
  - status (String, optional): initial service status
  - deregistercriticalserviceafter (String, optional, Consul 0.7+): timeout after
    which to automatically deregister service if check remains in critical state
- checks (Object[], optional): service checks (see `check` above)
- connect (Object, optional): specifies the [configuration](https://www.consul.io/api/agent/service.html#connect-structure) for Connect
- proxy (Object, optional): specifies the [configuration](https://www.consul.io/docs/connect/registration/service-registration.html) for a Connect proxy instance
- taggedAddresses (Object, optional): specifies a map of explicit LAN and WAN addresses for the service instance

Usage

```javascript
await consul.agent.service.register("example");
```

<a id="agent-service-deregister"></a>

### consul.agent.service.deregister(options)

Deregister a service.

Options

- id (String): service ID

Usage

```javascript
await consul.agent.service.deregister("example");
```

<a id="agent-service-maintenance"></a>

### consul.agent.service.maintenance(options)

Set service maintenance mode.

Options

- id (String): service ID
- enable (Boolean): maintenance mode enabled
- reason (String, optional): human readable reason for maintenance

Usage

```javascript
await consul.agent.service.maintenance({ id: "example", enable: true });
```

<a id="catalog"></a>

### consul.catalog

- [register](#catalog-register)
- [deregister](#catalog-deregister)
- [datacenters](#catalog-datacenters)
- [connect](#catalog-connect)
- [node](#catalog-node)
- [service](#catalog-service)

<a id="catalog-register"></a>

### consul.catalog.register(options)

Registers or updates entries in the catalog.

NOTE: this endpoint is a low-level mechanism for registering or updating entries in the catalog. It is usually preferable to instead use the agent endpoints for registration as they are simpler and perform anti-entropy. It is suggested to read the [catalog API](https://developer.hashicorp.com/consul/api-docs/catalog) documentation before using that.

Options

- id (String, optional): an optional UUID to assign to the node. This must be a 36-character UUID-formatted string
- node (String, required): specifies the node ID to register
- address (String, required): specifies the address to register.
- taggedaddresses (Object, optional): specifies the tagged addresses
- nodemeta (Object, optional): specifies arbitrary KV metadata pairs for filtering purposes
- service (Objet, optional): specifies to register a service
  - id (String): service ID. If ID is not provided, it will be defaulted to the value of the Service.Service property.
    Only one service with a given ID may be present per node.
  - service (String): service name
  - tags (String[], optional): service tags
  - meta (Object, optional): metadata linked to the service instance
  - address (String): service IP address
  - port (Integer): service port
- check (Object, optional): specifies to register a check.The register API manipulates the health check entry in the Catalog, but it does not setup the
  TCP/HTTP check to monitor the node's health.
  - node (String): the node id this check will bind to
  - name (String): check name
  - checkid (String): the CheckID can be omitted and will default to the value of Name. The CheckID must be unique on this node.
  - serviceid (String): if a ServiceID is provided that matches the ID of a service on that node, the check is treated as a service level health check, instead of a node level health check.
  - notes (String): notes is an opaque field that is meant to hold human-readable text
  - status (String): initial status. The Status must be one of `passing`, `warning`, or `critical`.
  - definition (Object): health check definition
    - http (String): URL endpoint, requires interval
    - tlsskipverify (Boolean, default: false): skip HTTPS verification
    - tlsservername (String): SNI
    - tcp (String): host:port to test, passes if connection is established, fails otherwise
    - intervalduration (String): interval to run check, requires script (ex: `15s`)
    - timeoutduration (String): timeout for the check (ex: `10s`)
    - deregistercriticalserviceafterduration (String): timeout after
      which to automatically deregister service if check remains in critical state (ex: `120s`)
- checks (Object[], optional): multiple checks can be provided by replacing `check` with `checks` and sending an array of `check` objects.
- skipnodeupdate (Bool, optional): pecifies whether to skip updating the node's information in the registration. Note, if the parameter is enabled for a node that doesn't exist, it will still be created

Usage

```javascript
await consul.catalog.register("example");
```

<a id="catalog-deregister"></a>

### consul.catalog.deregister(options)

Deregister entries in the catalog.

NOTE:This endpoint is a low-level mechanism for directly removing entries from the Catalog. It is usually preferable to instead use the agent endpoints for deregistration as they are simpler and perform anti-entropy. It is suggested to read the [catalog API](https://developer.hashicorp.com/consul/api-docs/catalog) documentation before using that.

Options

- node (String, required): specifies the ID of the node. If no other values are provided, this node, all its services, and all its checks are removed.
- checkid (String, optional): specifies the ID of the check to remove.
- serviceid (String, optional): specifies the ID of the service to remove. The service and all associated checks will be removed.

Usage

```javascript
await consul.catalog.deregister("example");
```

or

```javascript
await consul.catalog.deregister({ id: "example" });
```

<a id="catalog-datacenters"></a>

### consul.catalog.datacenters()

Lists known datacenters.

Usage

```javascript
await consul.catalog.datacenters();
```

Result

```json
["dc1"]
```

<a id="catalog-connect"></a>

### consul.catalog.connect

- [nodes](#catalog-connect-nodes)

<a id="catalog-connect-nodes"></a>

### consul.catalog.connect.nodes(options)

Lists the nodes for a given Connect-capable service.

Options

- service (String): service name
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.catalog.connect.nodes("example");
```

Result

```json
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
    "ServiceTags": ["tacos"]
  }
]
```

<a id="catalog-node"></a>

### consul.catalog.node

- [list](#catalog-node-list)
- [services](#catalog-node-services)

<a id="catalog-node-list"></a>

### consul.catalog.node.list([options])

Lists nodes in a given datacenter.

Options

- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.catalog.node.list();
```

Result

```json
[
  {
    "Node": "node1",
    "Address": "127.0.0.1"
  }
]
```

<a id="catalog-node-services"></a>

### consul.catalog.node.services(options)

Lists the services provided by a node.

Options

- node (String): node ID

Usage

```javascript
await consul.catalog.node.services("node1");
```

Result

```json
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
      "Tags": ["dev", "web"],
      "Port": 80
    }
  }
}
```

<a id="catalog-service"></a>

### consul.catalog.service

- [list](#catalog-service-list)
- [nodes](#catalog-service-nodes)

<a id="catalog-service-list"></a>

### consul.catalog.service.list([options])

Lists services in a given datacenter.

Options

- dc (String): datacenter (defaults to local for agent)

Usage

```javascript
await consul.catalog.service.list();
```

Result

```json
{
  "consul": [],
  "example": ["dev", "web"]
}
```

<a id="catalog-service-nodes"></a>

### consul.catalog.service.nodes(options)

Lists the nodes for a given service.

Options

- service (String): service name
- dc (String, optional): datacenter (defaults to local for agent)
- tag (String, optional): filter by tag

Usage

```javascript
await consul.catalog.service.nodes("example");
```

Result

```json
[
  {
    "Node": "node1",
    "Address": "127.0.0.1",
    "ServiceID": "example",
    "ServiceName": "example",
    "ServiceTags": ["dev", "web"],
    "ServicePort": 80
  }
]
```

<a id="event"></a>

### consul.event

- [fire](#event-fire)
- [list](#event-list)

<a id="event-fire"></a>

### consul.event.fire(options)

Fires a new user event.

Options

- name (String): event name
- payload (String|Buffer): payload
- node (String, optional): regular expression to filter by node
- service (String, optional): regular expression to filter by service
- tag (String, optional): regular expression to filter by tag

Usage

```javascript
await consul.event.fire("deploy", "53");
```

Result

```json
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

<a id="event-list"></a>

### consul.event.list([options])

Lists the most recent events an agent has seen.

Options

- name (String, optional): filter by event name

Usage

```javascript
await consul.event.list("deploy");
```

Result

```json
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

<a id="health"></a>

### consul.health

- [node](#health-node)
- [checks](#health-checks)
- [service](#health-service)
- [state](#health-state)

<a id="health-node"></a>

### consul.health.node(options)

Returns the health info of a node.

Options

- node (String): node
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.health.node("node1");
```

Result

```json
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

<a id="health-checks"></a>

### consul.health.checks(options)

Returns the checks of a service.

Options

- service (String): service name
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.health.checks("example");
```

Result

```json
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

<a id="health-service"></a>

### consul.health.service(options)

Returns the nodes and health info of a service.

Options

- service (String): service name
- dc (String, optional): datacenter (defaults to local for agent)
- tag (String, optional): filter by tag
- passing (Boolean, optional): restrict to passing checks

Usage

```javascript
await consul.health.service("example");
```

Result

```json
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

<a id="health-state"></a>

### consul.health.state(options)

Returns the checks in a given state.

Options

- state (String, enum: any, passing, warning, critical): state
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.health.state("critical");
```

Result

```json
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

<a id="kv"></a>

### consul.kv

- [get](#kv-get)
- [keys](#kv-keys)
- [set](#kv-set)
- [del](#kv-del)

<a id="kv-get"></a>

### consul.kv.get(options)

Return key/value (kv) pair(s) or `undefined` if key not found.

Options

- key (String): path to value
- dc (String, optional): datacenter (defaults to local for agent)
- recurse (Boolean, default: false): return all keys with given key prefix
- index (String, optional): used with `ModifyIndex` to block and wait for changes
- wait (String, optional): limit how long to wait for changes (ex: `5m`), used with index
- raw (Boolean, optional): return raw value (can't be used with recursive, implies buffer)
- buffer (Boolean, default: false): decode value into Buffer instead of String

Usage

```javascript
await consul.kv.get("hello");
```

Result

```json
{
  "CreateIndex": 6,
  "ModifyIndex": 6,
  "LockIndex": 0,
  "Key": "hello",
  "Flags": 0,
  "Value": "world"
}
```

<a id="kv-keys"></a>

### consul.kv.keys(options)

Return keys for a given prefix.

Options

- key (String): path prefix
- dc (String, optional): datacenter (defaults to local for agent)
- separator (String, optional): list keys up to a given separator

Usage

```javascript
await consul.kv.keys("a/");
```

Result

```json
["a/b", "a/c"]
```

<a id="kv-set"></a>

### consul.kv.set(options)

Set key/value (kv) pair.

Options

- key (String): key
- value (String|Buffer): value
- dc (String, optional): datacenter (defaults to local for agent)
- flags (Number, optional): unsigned integer opaque to user, can be used by application
- cas (String, optional): use with `ModifyIndex` to do a check-and-set operation
- acquire (String, optional): session ID, lock acquisition operation
- release (String, optional): session ID, lock release operation

Usage

```javascript
await consul.kv.set("hello", "world");
```

Result

```json
true
```

<a id="kv-del"></a>

### consul.kv.del(options)

Delete key/value (kv) pair(s).

Options

- key (String): key
- dc (String, optional): datacenter (defaults to local for agent)
- recurse (Boolean, default: false): delete all keys with given key prefix
- cas (String, optional): use with `ModifyIndex` to do a check-and-set operation (must be greater than `0`)

Usage

```javascript
await consul.kv.del("hello");
```

<a id="query"></a>

### consul.query

- [list](#query-list)
- [create](#query-create)
- [update](#query-update)
- [get](#query-get)
- [destroy](#query-destroy)
- [execute](#query-execute)
- [explain](#query-explain)

<a id="query-list"></a>

### consul.query.list()

List prepared query.

Usage

```javascript
await consul.query.list();
```

Result

```json
[
  {
    "ID": "422b14b9-874b-4520-bd2e-e149a42b0066",
    "Name": "redis",
    "Session": "",
    "Token": "",
    "Template": {
      "Type": "",
      "Regexp": ""
    },
    "Service": {
      "Service": "redis",
      "Failover": {
        "NearestN": 3,
        "Datacenters": ["dc1", "dc2"]
      },
      "OnlyPassing": false,
      "Tags": ["master", "!experimental"]
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

<a id="query-create"></a>

### consul.query.create(options)

Create a new prepared query.

Options

- name (String, optional): name that can be used to execute a query instead of using its ID
- session (String, optional): provides a way to automatically remove a prepared query when the given session is invalidated
- token (String, optional): captured ACL Token that is reused as the ACL Token every time the query is executed
- near (String, optional): allows specifying a particular node to sort near based on distance sorting using Network Coordinates
- service.service (String, required): name of the service to query
- service.failover.nearestn (Number, optional): when set the query will be forwarded to up to nearest N other datacenters based on their estimated network round trip time using Network Coordinates from the WAN gossip pool
- service.failover.datacenters (String[], optional): fixed list of remote datacenters to forward the query to if there are no healthy nodes in the local datacenter
- service.onlypassing (Boolean, default: false): filter results to only nodes with a passing state
- service.tags (String[], optional): list of service tags to filter the query results
- ttl.dns (String, optional, ex: `10s`): controls how the TTL is set when query results are served over DNS

Usage

```javascript
await consul.query.create({
  name: 'redis',
  service: {
    service: 'redis'
    onlypassing: true
  },
});
```

Result

```json
{
  "ID": "422b14b9-874b-4520-bd2e-e149a42b0066"
}
```

<a id="query-update"></a>

### consul.query.update(options)

Update existing prepared query.

Options

- query (String, required): ID of the query

And all [create options][query-create].

Usage

```javascript
await consul.query.update({
  query: '422b14b9-874b-4520-bd2e-e149a42b0066',
  name: 'redis',
  service: {
    service: 'redis'
    onlypassing: false
  },
});
```

<a id="query-get"></a>

### consul.query.get(options)

Get prepared query.

Options

- query (String, required): ID of the query

Usage

```javascript
await consul.query.get("6119cabf-c052-48fe-9f07-711762e52931");
```

Result

```json
{
  "ID": "6119cabf-c052-48fe-9f07-711762e52931",
  "Name": "redis",
  "Session": "",
  "Token": "",
  "Template": {
    "Type": "",
    "Regexp": ""
  },
  "Service": {
    "Service": "redis",
    "Failover": {
      "NearestN": 3,
      "Datacenters": ["dc1", "dc2"]
    },
    "OnlyPassing": false,
    "Tags": ["master", "!experimental"]
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

<a id="query-destroy"></a>

### consul.query.destroy(options)

Delete prepared query.

Options

- query (String, required): ID of the query

Usage

```javascript
await consul.query.destroy("422b14b9-874b-4520-bd2e-e149a42b0066");
```

<a id="query-execute"></a>

### consul.query.execute(options)

Execute prepared query.

Options

- query (String, required): ID of the query

Usage

```javascript
await consul.query.execute("6119cabf-c052-48fe-9f07-711762e52931");
```

Result

```json
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

<a id="query-explain"></a>

### consul.query.explain(options)

Explain prepared query.

Options

- query (String, required): ID of the query

Usage

```javascript
await consul.query.explain("422b14b9-874b-4520-bd2e-e149a42b0066");
```

Result

```json
{
  "Query": {
    "ID": "422b14b9-874b-4520-bd2e-e149a42b0066",
    "Name": "redis",
    "Session": "",
    "Token": "",
    "Template": {
      "Type": "",
      "Regexp": ""
    },
    "Service": {
      "Service": "redis",
      "Failover": {
        "NearestN": 3,
        "Datacenters": ["dc1", "dc2"]
      },
      "OnlyPassing": false,
      "Tags": ["master", "!experimental"]
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

<a id="session"></a>

### consul.session

- [create](#session-create)
- [destroy](#session-destroy)
- [get](#session-get)
- [node](#session-node)
- [list](#session-list)
- [renew](#session-renew)

<a id="session-create"></a>

### consul.session.create([options])

Create a new session.

Options

- dc (String, optional): datacenter (defaults to local for agent)
- lockdelay (String, range: 1s-60s, default: `15s`): the time consul prevents locks held by the session from being acquired after a session has been invalidated
- name (String, optional): human readable name for the session
- node (String, optional): node with which to associate session (defaults to connected agent)
- checks (String[], optional): checks to associate with session
- behavior (String, enum: release, delete; default: release): controls the behavior when a session is invalidated
- ttl (String, optional, valid: `10s`-`86400s`): interval session must be renewed

Usage

```javascript
await consul.session.create();
```

Result

```json
{
  "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1"
}
```

<a id="session-destroy"></a>

### consul.session.destroy(options)

Destroy a given session.

Options

- id (String): session ID
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.session.destroy("a0f5dc05-84c3-5f5a-1d88-05b875e524e1");
```

<a id="session-get"></a>

### consul.session.get(options)

Queries a given session.

Options

- id (String): session ID
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.session.get("a0f5dc05-84c3-5f5a-1d88-05b875e524e1");
```

Result

```json
{
  "CreateIndex": 11,
  "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
  "Name": "",
  "Node": "node1",
  "Checks": ["serfHealth"],
  "LockDelay": 15000000000
}
```

<a id="session-node"></a>

### consul.session.node(options)

Lists sessions belonging to a node.

Options

- node (String): node
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.session.node("node1");
```

Result

```json
[
  {
    "CreateIndex": 13,
    "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
    "Name": "",
    "Node": "node1",
    "Checks": ["serfHealth"],
    "LockDelay": 15000000000
  }
]
```

<a id="session-list"></a>

### consul.session.list([options])

Lists all the active sessions.

Options

- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.session.list();
```

Result

```json
[
  {
    "CreateIndex": 15,
    "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
    "Name": "",
    "Node": "node1",
    "Checks": ["serfHealth"],
    "LockDelay": 15000000000
  }
]
```

<a id="session-renew"></a>

### consul.session.renew(options)

Renew a given session.

Options

- id (String): session ID
- dc (String, optional): datacenter (defaults to local for agent)

Usage

```javascript
await consul.session.renew("a0f5dc05-84c3-5f5a-1d88-05b875e524e1");
```

Result

```json
[
  {
    "CreateIndex": 15,
    "ID": "a0f5dc05-84c3-5f5a-1d88-05b875e524e1",
    "Name": "",
    "Node": "node1",
    "Checks": ["serfHealth"],
    "LockDelay": 15000000000,
    "Behavior": "release",
    "TTL": ""
  }
]
```

<a id="status"></a>

### consul.status

- [leader](#status-leader)
- [peers](#status-peers)

<a id="status-leader"></a>

### consul.status.leader()

Returns the current Raft leader.

Usage

```javascript
await consul.status.leader();
```

Result

```json
"127.0.0.1:8300"
```

<a id="status-peers"></a>

### consul.status.peers()

Returns the current Raft peer set.

Usage

```javascript
await consul.status.peers();
```

Result

```json
["127.0.0.1:8300"]
```

<a id="transaction"></a>

### consul.transaction.create(operations)

operations: The body of the request should be a list of operations to perform inside the atomic transaction. Up to 64 operations may be present in a single transaction.

Usage

```javascript
await consul.transaction.create([
  {
    {
      KV: {
        Verb: 'set',
        Key: 'key1',
        Value: Buffer.from('value1').toString('base64')
      }
    },{
      KV: {
        Verb: 'delete',
        Key: 'key2'
      }
    }
  }
]);
```

<a id="watch"></a>

### consul.watch(options)

Watch an endpoint for changes.

The watch relies on blocking queries, adding the `index` and `wait` parameters as per [Consul's documentation](https://www.consul.io/docs/agent/http.html)

If a blocking query is dropped due to a Consul crash or disconnect, watch will attempt to reinitiate the blocking query with logarithmic backoff.

Upon reconnect, unlike the first call to watch() in which the latest `x-consul-index` is unknown, the last known `x-consul-index` will be reused, thus not emitting the `change` event unless it has been incremented since.

NOTE: If you specify an alternative options.timeout keep in mind that a small random amount of additional wait is added to all requests (wait / 16). The default timeout is currently set to (wait + wait \* 0.1), you should use something similar to avoid issues.

Options

- method (Function): method to watch
- options (Object): method options
- backoffFactor (Integer, default: 100): backoff factor in milliseconds to apply between attempts (`backoffFactor * (2 ^ retry attempt)`)
- backoffMax (Integer, default: 30000): maximum backoff time in milliseconds to wait between attempts
- maxAttempts (Integer): maximum number of retry attempts to make before giving up

Usage

```javascript
const watch = consul.watch({
  method: consul.kv.get,
  options: { key: "test" },
  backoffFactor: 1000,
});

watch.on("change", (data, res) => {
  console.log("data:", data);
});

watch.on("error", (err) => {
  console.log("error:", err);
});

setTimeout(() => {
  watch.end();
}, 30 * 1000);
```

## Acceptance Tests

1.  Install [Consul][download] into your `PATH`

    ```console
    $ brew install consul
    ```

1.  Attach required IPs

    ```console
    $ sudo ifconfig lo0 alias 127.0.0.2 up
    $ sudo ifconfig lo0 alias 127.0.0.3 up
    ```

1.  Install client dependencies

    ```console
    $ npm install
    ```

1.  Run tests

    ```console
    $ npm run acceptance
    ```

## License

This work is licensed under the MIT License (see the LICENSE file).

Parts of the Documentation were copied from the official
[Consul website][consul-docs-api], see the NOTICE file for license
information.

[consul]: https://www.consul.io/
[consul-docs-api]: https://www.consul.io/api-docs
[download]: https://www.consul.io/downloads
