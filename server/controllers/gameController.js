import { authenticateToken } from "../middlewares/auth.js";
import authController from "./authController.js";

const activeRooms = [];

export default function gameController(gameNamespace) {

    gameNamespace.use(authenticateToken);

    gameNamespace.on('connection', (socket) => {
        console.log(`User ${socket.login} connected to game socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        socket.on('active rooms', () => {
            socket.emit('active rooms', { activeRooms: Object.values(activeRooms) });
        });

        socket.on('create game', ({ language, minutesPerPlayer, roomName }) => {

            const creator = socket.login;
            const roomID = socket.userID;
            if (activeRooms[roomID]) {
                return socket.emit('create error', { message: 'Room already exist' });
            }

            activeRooms[roomID] = {
                players: [socket.login],
                roomName: roomName,
                language: language,
                minutesPerPlayer: minutesPerPlayer,
                creator: creator,
                started: false,
                id: roomID,
            };

            socket.join(roomID);
            console.log(`User ${creator} created room ${roomName}`);
            socket.emit('game created', { room: activeRooms[roomID] });
            gameNamespace.emit('active rooms', { activeRooms: Object.values(activeRooms) });
        });

        socket.on('join game', ({ id }) => {
            if (activeRooms[id]) {
                if (activeRooms[id].started) {
                    return socket.emit('join error', { message: 'Game has already started' });
                } else {
                    socket.join(id);

                    if (!activeRooms[id].players.includes(socket.login)) {
                        activeRooms[id].players.push(socket.login);
                    }

                    socket.emit('joined', { room: activeRooms[id] });
                    gameNamespace.to(id).emit('user joined', { message: `User ${socket.login} joined`, users: activeRooms[id].players });
                    gameNamespace.emit('active rooms', { activeRooms: Object.values(activeRooms) });

                    console.log(`${socket.login} joined room ${activeRooms[id].roomName}`);
                }
            } else {
                socket.emit('join error', { message: 'Room does not exists' });
            }
        });

        socket.on('leave game', ({ id }) => {
            if (activeRooms[id]) {
                if (id === socket.userID) {
                    const index = activeRooms.indexOf(id);
                    activeRooms.splice(index, 1);
                    gameNamespace.to(id).emit('game canceled');
                } else {
                    const index = activeRooms[id].players.indexOf(socket.login);
                    if (index !== -1) {
                        activeRooms[id].players.splice(index, 1);
                        gameNamespace.to(id).emit('user left', { message: `User ${socket.login} left`, users: activeRooms[id].players });
                    }
                }
                gameNamespace.emit('active rooms', { activeRooms: Object.values(activeRooms) });
            }
        });

        socket.on('start game', () => {
            gameNamespace.to(socket.userID).emit('game started');
        });

        socket.on('cancel game', () => {
            gameNamespace.to(login.userID).emit('game canceled');
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.login} disconnected from game socket`);
        });

    });
}