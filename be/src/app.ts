'use strict';
import ServerConfig from './configs/server.config';
import {Application, Router} from 'express';
import RootRouter from './controlers/root.router';
import RestRouter from './controlers/rest.router';
import ResolveRouter from './controlers/resolve.router';
import HealthRouter from './controlers/health.router';
import * as bodyParser from "body-parser";
// @ts-ignore
const express = require('express');

const serverConfig: ServerConfig = new ServerConfig();
const app: Application = express();
app.use(bodyParser.json())

const routes: Router[] = [RootRouter, RestRouter, ResolveRouter, HealthRouter];

// Add automatically all configured routes within the router
console.log('Configured routes:')
routes.forEach((router: Router) =>

  router.stack.forEach((routConfig: any) => {
    const configuredMethods: any = routConfig.route.methods;

    Object.keys(configuredMethods).forEach((supportedHttpRequest: string) => {
      if(configuredMethods[supportedHttpRequest]) {
        // @ts-ignore
        app[supportedHttpRequest](routConfig.route.path, router);
        console.log(`${supportedHttpRequest.toUpperCase()} ${routConfig.route.path}`);
      }
    });
  }));

const runningCallback = (): void => console.log(`Running on baseUrl http://${serverConfig.host}:${serverConfig.port}`);

app.listen(serverConfig.port, serverConfig.host, runningCallback);
