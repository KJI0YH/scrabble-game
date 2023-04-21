import db from "../../database/db.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { ObjectId } from "mongodb";
export const MAX_LETTERS_COUNT = 7;

const roomTimers = [];

export default function playController(playNamespace) {

    playNamespace.use(authenticateToken);

    playNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/play socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        const room = await db.collection('rooms').findOne({ players: { $elemMatch: { $eq: socket.login } } })
        if (room) {
            const roomID = room._id.toString();
            socket.join(roomID);
            const game = await db.collection('games').findOne({ roomID: roomID });
            if (game) {
                playNamespace.to(roomID).emit('game state', { game: game });
            }

            if (!roomTimers[roomID]) {
                roomTimers[roomID] = setInterval(async () => {
                    const game = await db.collection('games').findOne({ roomID: roomID });
                    if (game) {
                        const player = game.players[0];
                        if (player.timeLeft > 0) {
                            await db.collection('games').updateOne(
                                { roomID: roomID },
                                { $inc: { 'players.0.timeLeft': -1 } }
                            );
                        }

                        // Time is up
                        else {
                            //playNamespace.to(roomID).emit('time up');
                        }
                        playNamespace.to(roomID).emit('timer tick', { login: player.login, timeLeft: Math.max(player.timeLeft - 1, 0) });
                    }
                }, 1000);
            }
        }

        socket.on('move submit', ({ id, letters }) => {

        });

        socket.on('move skip', () => {

        });

        socket.on('move swap', () => {

        });
    });
}

function getLetters(count, bag) {
    let letters = [];
    let availableLetters = bag.filter(letter => letter.count > 0);
    for (let i = 0; i < count; i++) {
        if (availableLetters.length === 0) break;
        const index = Math.floor(Math.random() * availableLetters.length);
        letters.push({
            letter: availableLetters[index].letter,
            value: availableLetters[index].value,
        });

        availableLetters[index].count--;
        if (availableLetters[index].count === 0) {
            availableLetters = availableLetters.filter(letter => letter.count > 0);
        }
    }
    return letters;
}

function startTimer(roomID) {

}