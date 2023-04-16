import './database/db.js';
import express, { response } from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import defaultRoutes from './routes/defaultRoutes.js';

import { config } from './config.js';
import { handleError } from './middlewares/error.js';
import chatController from './controllers/chatController.js';

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
const chatNamespace = io.of('/chat');
const gameNamespace = io.of('/game');

// Pass namespaces to controllers
chatController(chatNamespace);


app.use(express.json());
app.use(cors({ origin: config.ALLOW_LIST_HOSTS, credentials: true }));

// Routes
app.use('/api', defaultRoutes);
app.use('/api/auth', authRoutes);

app.use((error, _request, response, _) => {
    handleError(error, response);
})

app.listen(config.API_PORT, () => {
    console.log(`API listening on port: ${config.API_PORT}`);
})

server.listen(config.SOCKET_PORT, () => {
    console.log(`Socket listening on port: ${config.SOCKET_PORT}`);
})