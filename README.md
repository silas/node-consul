# Consul

This is a [Consul][consul] client.

## Test

``` console
$ consul agent -data-dir="$( mktemp -d -t consul )" -server -bootstrap
$ npm test
```

## License

This work is licensed under the MIT License (see the LICENSE file).

[consul]: http://www.consul.io/
