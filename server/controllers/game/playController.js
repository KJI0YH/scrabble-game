import db from "../../database/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

export const MAX_LETTERS_COUNT = 7;

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
        }
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