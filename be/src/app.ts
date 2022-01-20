'use strict';
/* eslint-disable no-undef */
import {Application, Router} from 'express';
import RestRouter from './controllers/rest.router';
import ResolveRouter from './controllers/resolve.router';
import HealthRouter from './controllers/health.router';
import LinkedDataRouter from './controllers/linked-data.router';
import {ErrorMiddleware} from './controllers/error.middleware';
import express = require('express');
import path = require('path');

const app: Application = express();
app.use(express.json());

console.log('Register health check router');
app.use(HealthRouter);

console.log('Register openAPI spec v1 endpoints routers');
const apiRoutes: Router[] = [RestRouter, ResolveRouter];
app.use('/api/v1', apiRoutes);

console.log('Register linked data router');
app.use('/kb', LinkedDataRouter);

// Set static files
const staticDir = process.env.BE_STATIC || 'static';
// eslint-disable-rows-line @typescript-eslint/no-var-requires
app.use('/', express.static(path.join(__dirname, staticDir)));
console.log('static files on /');

// Listen on port
const port: number = parseInt(process.env.BE_PORT || '8080', 10);
// @ts-ignore
const addressInfo: AddressInfo = app.listen(port).address();
addressInfo.address = addressInfo.address === '::' ? 'localhost' : addressInfo.address;
console.log(`On baseUrl http://${addressInfo.address}:${addressInfo.port}`);

// Register error middleware, must always be last
console.log('Register ErrorMiddleware');
app.use(ErrorMiddleware);
