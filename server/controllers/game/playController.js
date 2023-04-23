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
                socket.emit('game state', { game: game });
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

        socket.on('move submit', async ({ id, letters }) => {
            const game = await db.collection('games').findOne({ roomID: id });
            if (game) {
                // Validate input letters

                await db.collection('games').updateOne({ roomID: id }, { $push: { "board.cells": { $each: letters } } });

                const history = {
                    player: socket.login,
                    timestamp: new Date(),
                    type: 'submit',
                    points: 0,
                    words: [],
                };

                await db.collection('games').updateOne({ roomID: id }, { $push: { "history": history } });

                // Issuing new letters to the player
                const oldLetters = game.players.find(player => player.login = socket.login).letters;
                await letters.map(letter => {
                    const index = oldLetters.findIndex(item => item.letter === letter.cell.letter);
                    if (index !== -1) {
                        oldLetters.splice(index, 1);
                    }
                });
                const bag = game.tileBag;
                const newLetters = getLetters(letters.length, bag);
                const playerLetters = oldLetters.concat(newLetters);

                await db.collection('games').updateOne({ roomID: id }, { $set: { "tileBag": bag } });
                await db.collection('games').updateOne({ roomID: id, "players.login": socket.login }, { $set: { "players.$.letters": playerLetters } });

                // Passing the move to the next player
                await nextPlayer(id);

                const newState = await db.collection('games').findOne({ roomID: id });
                playNamespace.to(id).emit('game state', { game: newState });
            }
        });

        socket.on('move skip', async ({ id }) => {
            await nextPlayer(id);

            const history = {
                player: socket.login,
                timestamp: new Date(),
                type: 'skip',
            };

            await db.collection('games').updateOne({ roomID: id }, { $push: { "history": history } });

            const newState = await db.collection('games').findOne({ roomID: id });
            playNamespace.to(id).emit('game state', { game: newState });
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

async function nextPlayer(roomID) {
    const game = await db.collection('games').findOne({ roomID: roomID });
    if (game) {
        const players = game.players;

        const firstPlayer = players.shift();
        players.push(firstPlayer)

        await db.collection('games').updateOne(
            { roomID: roomID },
            {
                $set: {
                    "players": players
                }
            }
        );
    }
}