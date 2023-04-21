import { findGameNamespace } from "../../app.js";
import db from "../../database/db.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { getActiveRooms } from "./findController.js";

export default function createController(createNamespace) {

    createNamespace.use(authenticateToken);

    createNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/create socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        socket.on('create game', async ({ language, minutesPerPlayer, roomName }) => {
            const creator = socket.login;
            const createdRoom = await db.collection('rooms').findOne({ creator: creator })
            if (createdRoom) {
                socket.emit('create success');
            }

            const room = {
                players: [socket.login],
                name: roomName,
                language: language,
                minutesPerPlayer: minutesPerPlayer,
                creator: creator,
                started: false,
            }

            await db.collection('rooms').insertOne(room);
            socket.emit('create success');

            const activeRooms = await getActiveRooms();
            findGameNamespace.emit('active rooms', { activeRooms: activeRooms });
        });
    });
}
