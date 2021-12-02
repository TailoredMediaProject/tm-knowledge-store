ARG buildImage=node:16.13.0-alpine
ARG appPath=/usr/src/app

FROM $buildImage as be-build-stage
WORKDIR $appPath/be
COPY ./be/package*.json ./
RUN npm ci
COPY ./be/ $appPath/be
RUN npm run build #later on generate:build
RUN npm prune

FROM $buildImage as fe-build-stage
WORKDIR $appPath/fe
COPY ./fe/package*.json ./
RUN npm ci
COPY ./fe/ .
RUN npm run build # TODO generate:build, java not found error
RUN npm prune

# TODO nginx:stable-alpine?
FROM $buildImage as production-stage
# BE
ENV NODE_ENV=production
ENV BE_HOST='0.0.0.0'
ENV BE_PORT='3000'
# MongoDB
ENV MONGO_URL=mongodb://mongodb:27017
ENV MONGO_ROOT_USERNAME=root
ENV MONGO_ROOT_PASSWORD=root
ENV MONGO_DATABASE=annotations
ENV MONGO_USERNAME=apollo
ENV MONGO_PASSWORD=apollo
ENV MONGO_REPLICA_SET_NAME=rs0

WORKDIR $appPath/be
COPY --from=be-build-stage $appPath/be/dist ./dist
COPY --from=be-build-stage $appPath/be/node_modules ./node_modules

EXPOSE 3000
CMD "node" "dist/app.js"

WORKDIR $appPath/fe
COPY --from=fe-build-stage $appPath/fe /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
