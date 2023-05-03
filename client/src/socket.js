import { io } from 'socket.io-client';

const serverURL = 'http://192.168.100.2:44444';
export const defaultSocket = io(serverURL, { autoConnect: false });
export const chatSocket = io(serverURL + '/chat', { autoConnect: false });
export const createGameSocket = io(serverURL + '/game/create', { autoConnect: false });
export const findGameSocket = io(serverURL + '/game/find', { autoConnect: false });
export const waitGameSocket = io(serverURL + '/game/wait', { autoConnect: false });
export const playGameSocket = io(serverURL + '/game/play', { autoConnect: false });

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