import './database/db.js';
import express, { response } from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import defaultRoutes from './routes/defaultRoutes.js';
import userRoutes from './routes/userRoutes.js';

import { config } from './config.js';
import { handleError } from './middlewares/error.js';
import createController from './controllers/game/createController.js';
import findController from './controllers/game/findController.js';
import waitController from './controllers/game/waitController.js';
import playController from './controllers/game/playController.js';

const app = express();

// Create http server
const server = new http.Server(app);

// Create socket server
const io = new Server(server, {
    cors: {
        origin: config.ALLOW_LIST_HOSTS,
    }
});

// Define namespaces
export const createGameNamespace = io.of('/game/create');
export const findGameNamespace = io.of('/game/find');
export const waitGameNamespace = io.of('/game/wait');
export const playGameNamespace = io.of('/game/play');

// Pass namespaces to controllers
createController(createGameNamespace);
findController(findGameNamespace);
waitController(waitGameNamespace);
playController(playGameNamespace);

app.use(express.json());
app.use(cors({ origin: config.ALLOW_LIST_HOSTS, credentials: true }));

// Routes
app.use('/api', defaultRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use((error, _request, response, _) => {
    handleError(error, response);
})

app.listen(config.API_PORT, () => {
    console.log(`API listening on port: ${config.API_PORT}`);
})

server.listen(config.SOCKET_PORT, () => {
    console.log(`Socket listening on port: ${config.SOCKET_PORT}`);
})