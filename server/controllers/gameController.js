import { authenticateToken } from "../middlewares/auth.js";
import db from "../database/db.js";
import { ObjectId } from "mongodb";

export default function gameController(gameNamespace) {

    gameNamespace.use(authenticateToken);

    gameNamespace.on('connection', (socket) => {
        console.log(`User ${socket.login} connected to game socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        socket.on('active rooms', async () => {
            const activeRooms = await db.collection('rooms').find().toArray();
            socket.emit('active rooms', { activeRooms: activeRooms });
        });

        socket.on('create game', async ({ language, minutesPerPlayer, roomName }) => {
            const creator = socket.login;
            const createdRoom = await db.collection('rooms').findOne({ creator: creator })
            if (createdRoom) {
                socket.join(createdRoom._id.toString());
                return socket.emit('game created', { room: createdRoom });
            }

            const room = {
                players: [socket.login],
                name: roomName,
                language: language,
                minutesPerPlayer: minutesPerPlayer,
                creator: creator,
                started: false,
            }

            const result = await db.collection('rooms').insertOne(room);

            socket.join(room._id.toString());
            socket.emit('game created', { room: room });
            const activeRooms = await db.collection('rooms').find().toArray();
            gameNamespace.emit('active rooms', { activeRooms: activeRooms });

            console.log(`User ${creator} created room ${roomName}`);
        });

        socket.on('join game', async ({ id }) => {
            const roomID = new ObjectId(id);
            const room = await db.collection('rooms').findOne({ _id: roomID });
            if (room) {
                if (room.started) {
                    return socket.emit('join error', { message: 'Game has already started' });
                } else {
                    socket.join(id);
                    if (!room.players.includes(socket.login)) {
                        const updated = await db.collection('rooms').updateOne({ _id: roomID }, { $push: { players: socket.login } });
                    }
                }

                const activeRooms = await db.collection('rooms').find().toArray();
                const selectedRoom = await db.collection('rooms').findOne({ _id: roomID });

                gameNamespace.to(id).emit('user joined', { message: `User ${socket.login} joined`, room: selectedRoom });
                gameNamespace.emit('active rooms', { activeRooms: activeRooms });

                console.log(`${socket.login} joined room ${room.name}`);

            } else {
                socket.emit('join error', { message: 'Room does not exists' });
            }
        });

        socket.on('leave game', async ({ id }) => {
            const roomID = new ObjectId(id);
            const room = await db.collection('rooms').findOne({ _id: roomID });
            if (room) {
                if (room.creator === socket.login) {
                    await db.collection('rooms').deleteOne({ _id: roomID });
                    gameNamespace.to(id).emit('game canceled');
                } else {
                    const result = await db.collection('rooms').updateOne({ _id: roomID }, { $pull: { players: socket.login } });
                    const updatedRoom = await db.collection('rooms').findOne({ _id: roomID });
                    gameNamespace.to(id).emit('user left', { message: `User ${socket.login} left`, room: updatedRoom });
                }
            }
            const activeRooms = await db.collection('rooms').find().toArray();
            gameNamespace.emit('active rooms', { activeRooms: activeRooms });
        });

        socket.on('start game', async ({ id }) => {
            const roomID = new ObjectId(id);
            const result = await db.collection('rooms').updateOne({ _id: roomID }, { $set: { started: true } });

            const room = await db.collection('rooms').findOne({ _id: roomID });
            gameNamespace.to(id).emit('game started');

            console.log(`User ${socket.login} start the game ${room.name}`);
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.login} disconnected from game socket`);
        });

    });
}