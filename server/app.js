import './database/db.js';
import express from 'express';
import http from 'node:http';
import cors from 'cors';

import { config } from './config.js';

const app = express();
const server = new http.Server(app);

app.use(express.json());
app.use(cors({ origin: config.ALLOW_LIST_HOSTS, credentials: true }));

app.listen(config.API_PORT, () => {
    console.log(`API listening on port: ${config.API_PORT}`);
})

server.listen(config.SOCKET_PORT, () => {
    console.log(`Socket listening on port: ${config.SOCKET_PORT}`);
})