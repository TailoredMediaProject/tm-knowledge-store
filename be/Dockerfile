FROM node:16.13.0 as build-stage

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# npm ci --only=production

COPY . /usr/src/app

RUN npm run build

EXPOSE 8080

CMD "npm" "start"
