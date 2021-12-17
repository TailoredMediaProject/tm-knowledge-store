# Backend

This are the commands available for docker and the build pipeline, you should run only run `root_dir/docker-compose up` or `root_dir/docker-compose up -d` to also start the database.

Install:
```shell
nvm use && npm i && npm run generate
```
Lint:
```shell
npm run lint
```
Test:
```shell
npm run test
```
Build:
```shell
npm run build
```
Start:
```shell
npm run start
```

## Development

Please install the [IntelliJ Prettier Plugin](https://plugins.jetbrains.com/plugin/10456-prettier) and enable it with `Run on save for files` set in its settings of IntelliJ.

## Generate
The [openapi-generator](https://openapi-generator.tech) is used for creating service side stubs, see the [general documentation](https://openapi-generator.tech/docs/configuration/) and the one for [typescript-axios](
https://openapi-generator.tech/docs/generators/typescript-axios). To generate run 
```shell
npm run generate
```

## Docker

```shell
docker exec -it <container_id_or_name> mongo # mongo mongo works as the container name is mongo
```
