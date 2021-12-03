ARG buildImage=node:16.13.0-alpine

# BE
FROM $buildImage as be-build-stage
WORKDIR /usr/src/app/
COPY ./be/package*.json ./
RUN npm ci
COPY ./be .
COPY ./openapi.yaml ../
ENV NODE_ENV=production
RUN apk add openjdk11
RUN npm run generate:build
RUN npm prune

# FE
FROM $buildImage as fe-build-stage
WORKDIR /usr/src/app/
COPY ./fe/package*.json ./
RUN npm ci
COPY ./fe/ .
COPY ./openapi.yaml ../
ENV NODE_ENV=production
RUN apk add openjdk11
RUN npm run generate:build
RUN npm prune

# Merge BE + FE
FROM $buildImage as production-stage
WORKDIR /app/
COPY --from=be-build-stage /usr/src/app/dist ./dist
COPY --from=be-build-stage /usr/src/app/node_modules ./node_modules
COPY --from=fe-build-stage /usr/src/app/dist ./dist/static

# BE
ENV NODE_ENV=production
ENV BE_PORT='8080'
# MongoDB
ENV MONGO_URL=mongodb://mongodb:27017
ENV MONGO_DATABASE=annotations
ENV MONGO_ROOT_USERNAME=root
ENV MONGO_ROOT_PASSWORD=root
ENV MONGO_USERNAME=apollo
ENV MONGO_PASSWORD=apollo

EXPOSE 8080
CMD "node" "./dist/app.js"
