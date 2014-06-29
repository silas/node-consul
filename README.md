# Consul

This is a [Consul][consul] client.

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
