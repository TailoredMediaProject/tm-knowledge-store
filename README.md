# TailoredMedia Knowledge Store

The TailoredMedia Knowledge Store provides CRUD operations on vocabulary consisting of entities enriched with data from external databases.

See the README.md in the subfolders for more information.

#Install
See the `be` and `fe` folder `README.md` files.

## Run

## Docker Compose
Use `docker-compose config` to verify that your `.yaml` is resolved correctly, then you can:

```shell 
docker-compose up -d // start
docker-compose down // stop
```

## Docker Image

Build, view, run locally

```shell
docker build . -t $(whoami)/tm-knowledge-store # Build
docker images # View build, available images
docker run -p 8080:8080 -d $(whoami)/tm-knowledge-store # Run image
docker ps # View running containers
docker logs <container_id> # Print container logs
docker stop <container_id> # Stop container
docker stop $(docker ps --format '{{.ID}}') # For only one running container
docker system prune # Removes all unused images
```

More documentation:

* https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
* https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
