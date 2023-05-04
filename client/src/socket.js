import { io } from 'socket.io-client';
import { config } from './config';

const SOCKET_URL = `${config.SERVER_URL}:${config.SOCKET_PORT}`
export const defaultSocket = io(SOCKET_URL, { autoConnect: false });
export const chatSocket = io(SOCKET_URL + '/chat', { autoConnect: false });
export const createGameSocket = io(SOCKET_URL + '/game/create', { autoConnect: false });
export const findGameSocket = io(SOCKET_URL + '/game/find', { autoConnect: false });
export const waitGameSocket = io(SOCKET_URL + '/game/wait', { autoConnect: false });
export const playGameSocket = io(SOCKET_URL + '/game/play', { autoConnect: false });

createGameSocket.onAny((event, ...args) => {
    console.log(event, args);
});

findGameSocket.onAny((event, ...args) => {
    console.log(event, args);
});

waitGameSocket.onAny((event, ...args) => {
    console.log(event, args);
});

playGameSocket.onAny((event, ...args) => {
    console.log(event, args);
});

createGameSocket.on('session', ({ login, userID }) => {
    createGameSocket.login = login;
    createGameSocket.userID = userID;
});

findGameSocket.on('session', ({ login, userID }) => {
    findGameSocket.login = login;
    findGameSocket.userID = userID;
});

waitGameSocket.on('session', ({ login, userID }) => {
    waitGameSocket.login = login;
    waitGameSocket.userID = userID;
});

playGameSocket.on('session', ({ login, userID }) => {
    playGameSocket.login = login;
    playGameSocket.userID = userID;
});