import './database/db.js';
import express, { response } from 'express';
import http from 'node:http';
import cors from 'cors';
import routes from './routes.js';

import { config } from './config.js';
import { handleError } from './middlewares/error.js';

const app = express();
const server = new http.Server(app);

app.use(express.json());
app.use(cors({ origin: config.ALLOW_LIST_HOSTS, credentials: true }));

routes(app);

app.use((error, _request, response, _) => {
    handleError(error, response);
})

app.listen(config.API_PORT, () => {
    console.log(`API listening on port: ${config.API_PORT}`);
})

server.listen(config.SOCKET_PORT, () => {
    console.log(`Socket listening on port: ${config.SOCKET_PORT}`);
})