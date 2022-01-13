ARG buildImage=node:lts-alpine

FROM $buildImage as base
WORKDIR /opt/app
RUN apk add --no-cache openjdk11
COPY ./openapi.yaml ./

FROM base as build-stage
# BE
WORKDIR /opt/app/be
COPY ./be/package*.json ./
RUN npm ci
COPY ./be ./
RUN npm run package

# Build FE into BE
WORKDIR /opt/app/fe
COPY ./fe/package*.json ./
RUN npm ci
COPY ./fe/ .
RUN npm run generate:build

# Merge BE + FE
FROM $buildImage as production-stage
RUN apk add --no-cache tini
WORKDIR /app/
RUN npm prune
COPY --from=build-stage /opt/app/be/dist .

ENV NODE_ENV=production
# BE
ENV BE_PORT='8080'
# MongoDB
ENV MONGO_HOST=mongodb
ENV MONGO_DATABASE=knowledge

USER node

EXPOSE $BE_PORT
ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh", "app.js" ]
