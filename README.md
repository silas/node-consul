# Consul

This is a [Consul][consul] client.

## Test

``` console
$ consul agent -data-dir=/tmp -server -bootstrap 2>&1 >> consul.log & echo $! > consul.pid
$ npm test
$ kill $( cat consul.pid ) && rm consul.pid
```

## License

This work is licensed under the MIT License (see the LICENSE file).

[consul]: http://www.consul.io/
