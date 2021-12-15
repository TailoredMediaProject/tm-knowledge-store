'use strict';
/* eslint-disable no-undef */
import {Application, Router} from 'express';
import RestRouter from './controlers/rest.router';
import ResolveRouter from './controlers/resolve.router';
import HealthRouter from './controlers/health.router';
import express = require('express');
import path = require('path');

const app: Application = express();
app.use(express.json())

console.log('Register Health-Check')
app.use(HealthRouter)

console.log('Register OpenAPI-Spec v1 endpoints')
const apiRoutes: Router[] = [RestRouter, ResolveRouter];
app.use('/api/v1', apiRoutes)

// Set static files
const staticDir = process.env.BE_STATIC || 'static';
// eslint-disable-next-line @typescript-eslint/no-var-requires
app.use('/', express.static(path.join(__dirname, staticDir)))
console.log('static files on /');

// Listen on port
const port: number = parseInt(process.env.BE_PORT || '8080', 10);
// @ts-ignore
const addressInfo: AddressInfo = app.listen(port).address();
addressInfo.address = addressInfo.address === '::' ? 'localhost' : addressInfo.address;
console.log(`On baseUrl http://${addressInfo.address}:${addressInfo.port}`)
