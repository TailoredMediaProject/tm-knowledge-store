ARG buildImage=node:16.13.0-alpine
ARG appPath=/usr/src/app

# BE
FROM $buildImage as be-build-stage
WORKDIR $appPath/be
COPY ./be/package*.json ./
RUN npm ci
COPY ./be .
RUN npm run build #TODO After TM-94 merge: generate:build
RUN npm prune

# FE
FROM $buildImage as fe-build-stage
WORKDIR $appPath/fe
COPY ./fe/package*.json ./
RUN npm ci
COPY ./fe/ .
RUN npm run build # TODO generate:build, java not found error
RUN npm prune

# Merge BE + FE
FROM $buildImage as production-stage
WORKDIR $appPath/
COPY --from=be-build-stage ./be/dist ./dist
COPY --from=be-build-stage ./be/node_modules ./node_modules
COPY --from=fe-build-stage ./fe/dist ./dist/static

# BE
ENV NODE_ENV=production
ENV BE_PORT='8080'
# MongoDB
ENV MONGO_URL=mongodb://mongodb:27017
ENV MONGO_DATABASE=annotations

EXPOSE 8080
CMD "node" "./dist/app.js"
