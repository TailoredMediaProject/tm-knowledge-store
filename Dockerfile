ARG buildImage=node:lts-alpine

FROM $buildImage as base
WORKDIR /opt/app
RUN apk add --no-cache openjdk11
COPY ./openapi.yaml ./

# BE
FROM base as be-build-stage
WORKDIR /opt/app/be
COPY ./be/package*.json ./
RUN npm ci
COPY ./be ./
RUN npm run package
RUN npm prune

# FE
FROM base as fe-build-stage
WORKDIR /opt/app/fe
COPY ./fe/package*.json ./
RUN npm ci
COPY ./fe/ .
RUN npm run generate:build
RUN npm prune

# Merge BE + FE
FROM $buildImage as production-stage
RUN apk add --no-cache tini
WORKDIR /app/
COPY --from=be-build-stage /opt/app/be/dist .
COPY --from=fe-build-stage /opt/app/fe/dist ./static

ENV NODE_ENV=production
# BE
ENV BE_PORT='8080'
# MongoDB
ENV MONGO_HOST=mongodb
ENV MONGO_DATABASE=knowledge

USER node

EXPOSE $BE_PORT
ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh", "app.js" ]
