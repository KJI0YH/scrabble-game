import db from "../../database/db.js";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../../middlewares/auth.js";
import { getActiveRooms } from "./findController.js";
import { findGameNamespace } from "../../app.js";
import { checkActiveParty } from "./playController.js";
import { createParty } from "./createController.js";

export default function waitController(waitNamespace) {

    waitNamespace.use(authenticateToken);

    waitNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/wait socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        // Check existing party
        const party = await checkActiveParty(socket.login);
        if (party) {
            return socket.emit('active party', { party: party });
        }

        const room = await db.collection('rooms').findOne({ players: { $elemMatch: { $eq: socket.login } } })
        if (room) {
            const roomID = room._id.toString();
            socket.join(roomID);
            waitNamespace.to(roomID).emit('user joined', { room: room });
        } else {
            socket.disconnect();
        }

        socket.on('leave game', async ({ id }) => {
            const roomID = new ObjectId(id);
            const room = await db.collection('rooms').findOne({ _id: roomID });
            if (room) {

                // Leave from game as a creator
                if (room.creator === socket.login) {
                    await db.collection('rooms').deleteOne({ _id: roomID });
                    waitNamespace.to(id).emit('game canceled');

                }

                // Leave from game as a guest                
                else {
                    await db.collection('rooms').updateOne({ _id: roomID }, { $pull: { players: socket.login } });
                    const updatedRoom = await db.collection('rooms').findOne({ _id: roomID });
                    waitNamespace.to(id).emit('user left', { room: updatedRoom });
                }

                // Notify about active rooms
                const activeRooms = await getActiveRooms();
                findGameNamespace.emit('active rooms', { activeRooms: activeRooms });
            }
        });

        socket.on('start game', async ({ id }) => {
            await createParty(id);
            waitNamespace.to(id).emit('game started');
        });
    });

};