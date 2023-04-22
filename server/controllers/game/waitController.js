import db from "../../database/db.js";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../../middlewares/auth.js";
import { getActiveRooms } from "./findController.js";
import { findGameNamespace } from "../../app.js";
import { getLetters } from "./gameController.js";
import { MAX_LETTERS_COUNT } from "./playController.js";

export default function waitController(waitNamespace) {

    waitNamespace.use(authenticateToken);

    waitNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/wait socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        const room = await db.collection('rooms').findOne({ players: { $elemMatch: { $eq: socket.login } } })
        if (room) {
            const roomID = room._id.toString();
            socket.join(roomID);
            waitNamespace.to(roomID).emit('user joined', { room: room });
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
            const roomID = new ObjectId(id);
            await db.collection('rooms').updateOne({ _id: roomID }, { $set: { started: true } });
            const room = await db.collection('rooms').findOne({ _id: roomID });

            // Get letters bag for game
            const lettersBag = await db.collection('lettersBags').findOne({ language: { $regex: new RegExp(`^${room.language}$`, 'i') } });
            let letters = lettersBag.letters;
            const players = [];

            // Giving each player the letters
            for (const player of room.players) {
                const user = await db.collection('users').findOne({ login: player });
                if (user) {
                    players.push({
                        id: user._id,
                        login: user.login,
                        score: 0,
                        letters: getLetters(MAX_LETTERS_COUNT, letters),
                        timeLeft: room.minutesPerPlayer * 60,
                    });
                }
            }

            const board = await db.collection('boards').findOne({ name: "classic" });
            const game = {
                roomID: id,
                players: players,
                tileBag: lettersBag.letters,
                board: {
                    size: board.size,
                    premium: board.premium,
                    cells: [],
                },
                history: [],
            };

            await db.collection('games').insertOne(game);
            waitNamespace.to(id).emit('game started');
        });
    });

};