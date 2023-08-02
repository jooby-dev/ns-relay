# Jooby NS Relay


## Deployment

```sh
# build
docker build . -t solomorion/ns-relay

# deploy
docker run --interactive --tty --rm --publish 3000:3000 --name ns-relay solomorion/ns-relay

# publish
docker push solomorion/ns-relay
```


## Environment

List of available environment variables.

| name                | default value | description                                                                                               |
| ------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| NODE_ENV            |               | node environment setup                                                                                    |
| LOG_LEVEL           | info          | [pino log levels](https://github.com/pinojs/pino/blob/master/docs/api.md#loggerlevel-string-gettersetter) |
| HTTP_HOST           | 0.0.0.0       | host name or IP                                                                                           |
| HTTP_PORT           | 3000          | port to serve                                                                                             |
| LOG_ENABLE_COLORIZE | true          | print colored logs                                                                                        |
