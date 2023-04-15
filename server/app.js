import './database/db.js';
import express, { response } from 'express';
import http from 'node:http';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import defaultRoutes from './routes/defaultRoutes.js';

import { config } from './config.js';
import { handleError } from './middlewares/error.js';

const app = express();
const server = new http.Server(app);

app.use(express.json());
app.use(cors({ origin: config.ALLOW_LIST_HOSTS, credentials: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/', defaultRoutes);

app.use((error, _request, response, _) => {
    handleError(error, response);
})

app.listen(config.API_PORT, () => {
    console.log(`API listening on port: ${config.API_PORT}`);
})

server.listen(config.SOCKET_PORT, () => {
    console.log(`Socket listening on port: ${config.SOCKET_PORT}`);
})