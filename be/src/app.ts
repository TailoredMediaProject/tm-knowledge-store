'use strict';
import {Application, Router} from 'express';
import RestRouter from './controlers/rest.router';
import ResolveRouter from './controlers/resolve.router';
import HealthRouter from './controlers/health.router';
// @ts-ignore
const express = require('express');
const app: Application = express();
const routes: Router[] = [RestRouter, ResolveRouter, HealthRouter];

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

// Set static files
const staticDir = process.env.BE_STATIC || 'static';
const path = require('path')
app.use('/', express.static(path.join(__dirname, staticDir)))
console.log(`static files on /`);

// Listen on port
const port: number = parseInt(process.env.BE_PORT || '8080', 10);
// @ts-ignore
const addressInfo: AddressInfo = app.listen(port).address();
addressInfo.address = addressInfo.address === '::' ? 'localhost' : addressInfo.address;
console.log(`On baseUrl http://${addressInfo.address}:${addressInfo.port}`)
