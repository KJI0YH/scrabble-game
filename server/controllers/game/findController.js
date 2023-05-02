import { ObjectId } from "mongodb";
import db from "../../database/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

export default function findController(findNamespace) {

    findNamespace.use(authenticateToken);

    findNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/find socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        // Check existing wait room
        const existWait = await checkExistWait(socket.login);
        if (existWait) {
            socket.emit('join success');
        }

        socket.on('active rooms', async () => {
            const activeRooms = await getActiveRooms();
            socket.emit('active rooms', { activeRooms: activeRooms });
        });

        socket.on('join game', async ({ id }) => {
            const roomID = new ObjectId(id);
            const room = await db.collection('rooms').findOne({ _id: roomID });
            if (room) {
                if (!room.players.includes(socket.login)) {
                    await db.collection('rooms').updateOne({ _id: roomID }, { $push: { players: socket.login } });
                }
                socket.emit('join success');

                const activeRooms = await getActiveRooms();
                findNamespace.emit('active rooms', { activeRooms: activeRooms });
            } else {
                return socket.emit('join error', { message: 'Room does not exists' });
            }
        });

    });
}

export async function getActiveRooms() {
    const activeRooms = await db.collection('rooms').find().toArray();
    return activeRooms;
}

async function checkExistWait(login) {
    const waitRoom = await db.collection('rooms').findOne({ players: { $in: [login] } });
    if (waitRoom) {
        return waitRoom;
    }
}