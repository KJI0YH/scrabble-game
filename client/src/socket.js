import { io } from 'socket.io-client';

const serverURL = 'http://localhost:44444';
export const defaultSocket = io(serverURL, { autoConnect: false });
export const chatSocket = io(serverURL + '/chat', { autoConnect: false });
export const gameSocket = io(serverURL + '/game', { autoConnect: false });

gameSocket.onAny((event, ...args) => {
    console.log(event, args);
});

gameSocket.on('session', ({ login, userID }) => {
    gameSocket.login = login;
    gameSocket.userID = userID;
});