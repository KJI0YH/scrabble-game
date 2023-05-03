import db from "../../database/db.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { validateWord } from "../../utils/wordsDictionary.js";
import { ObjectId } from "mongodb";

export const MAX_LETTERS_COUNT = 7;
const BONUS = 50;

const roomTimers = [];

export default function playController(playNamespace) {

    playNamespace.use(authenticateToken);

    // Connection to game
    playNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/play socket`);

        // Send session credentials
        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        // Check active party for player
        const activeParty = await checkActiveParty(socket.login);
        if (activeParty) {
            const roomID = activeParty.roomID;
            socket.join(roomID);
            socket.emit('game state', { game: activeParty });

            // Add game timer
            if (!roomTimers[roomID]) {
                roomTimers[roomID] = setInterval(async => {
                    timerTick(roomID, playNamespace)
                }, 1000);
            }
        }

        // Standart move, submit tiles, scoring and get new letters
        socket.on('move submit', async ({ id, letters }) => {
            const party = await db.collection('parties').findOne({ roomID: id });
            if (party) {

                // Get player from party
                const player = party.players.find(p => p.login === socket.login);

                // User letters verification
                const valid = verificateLetters(player.letters, letters.map(letter => letter.cell));

                if (valid) {

                    // Check validity of positions
                    // Check initial tile

                    // Scoring
                    const score = getScore(letters, party.board.premium);

                    // Update party history
                    const history = {
                        player: socket.login,
                        timestamp: new Date(),
                        type: 'submit',
                        score: score,
                        letters: letters,
                    };

                    // Issuing new letters to the player
                    const newLetters = getLetters(MAX_LETTERS_COUNT - player.letters.length, party.bag);
                    player.letters = player.letters.concat(newLetters);

                    // Making changes to the state of the party
                    await db.collection('parties').updateOne({ roomID: id }, {
                        $set: { "bag": party.bag },
                        $push: {
                            "board.cells": { $each: letters },
                            "history": history
                        },
                    });
                    await db.collection('parties').updateOne({ roomID: id, "players.login": socket.login }, {
                        $set: { "players.$.letters": player.letters },
                        $inc: { "players.$.score": score }
                    });

                    // Passing the move to the next player
                    await nextPlayer(id);
                }

                const newState = await db.collection('parties').findOne({ roomID: id });
                playNamespace.to(id).emit('game state', { game: newState });
            }
        });

        // Skipping witout replacing tiles
        socket.on('move skip', async ({ id }) => {
            await nextPlayer(id);

            const history = {
                player: socket.login,
                timestamp: new Date(),
                type: 'skip',
            };

            await db.collection('parties').updateOne({ roomID: id }, { $push: { "history": history } });

            const newState = await db.collection('parties').findOne({ roomID: id });
            playNamespace.to(id).emit('game state', { game: newState });
        });

        // Skipping with replacing tiles
        socket.on('move swap', async ({ id, letters }) => {
            const party = await db.collection('parties').findOne({ roomID: id });
            if (party) {

                // Get player from party
                const player = party.players.find(p => p.login === socket.login);

                // User letters verification
                const valid = verificateLetters(player.letters, letters);

                if (valid) {

                    // Update party history
                    const history = {
                        player: socket.login,
                        timestamp: new Date(),
                        type: 'swap',
                        letters: letters,
                    };
                    await db.collection('parties').updateOne({ roomID: id }, { $push: { "history": history } });

                    // Return letters to the bag
                    await letters.map(letter => {
                        party.bag.map(tile => tile.letter === letter.letter ? tile.count++ : tile.count);
                    })

                    // Get new letters for the player
                    const newLetters = getLetters(MAX_LETTERS_COUNT - player.letters.length, party.bag);
                    player.letters = player.letters.concat(newLetters);

                    // Making changes to the state of the party
                    await db.collection('parties').updateOne({ roomID: id }, { $set: { "bag": party.bag } });
                    await db.collection('parties').updateOne({ roomID: id, "players.login": socket.login }, { $set: { "players.$.letters": player.letters } });

                    // Passing the move to the next player
                    await nextPlayer(id);
                }

                const newState = await db.collection('parties').findOne({ roomID: id });
                playNamespace.to(id).emit('game state', { game: newState });
            }
        });

        // Challenge

    });
}

// Getting letters of a given amount from the bag
export function getLetters(count, bag) {
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

// Selection of the player who moves next
async function nextPlayer(roomID) {
    const game = await db.collection('parties').findOne({ roomID: roomID });
    if (game) {
        const players = game.players;

        const firstPlayer = players.shift();
        players.push(firstPlayer)

        await db.collection('parties').updateOne(
            { roomID: roomID },
            {
                $set: {
                    "players": players
                }
            }
        );
    }
}

// Verificate user letters
function verificateLetters(serverLetters, clientLetters) {
    for (const cl of clientLetters) {
        const index = serverLetters.findIndex(sl => sl.letter === cl.letter && sl.value === cl.value)
        if (index !== -1) {
            serverLetters.splice(index, 1);
        } else {
            return false;
        }
    }
    return true;
}

// Player time tracking
async function timerTick(roomID, playNamespace) {
    const party = await db.collection('parties').findOne({ roomID: roomID });
    if (party) {
        const player = party.players[0];
        if (player.timeLeft > 0) {

            // Decrease player time
            await db.collection('parties').updateOne(
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
}

// Check active party for player
async function checkActiveParty(login) {
    const party = await db.collection('parties').findOne({ players: { $elemMatch: { login: login } } })
    if (party) {
        return party;
    }
}

// Player score calculation 
function getScore(tiles, premium) {
    let wordMultiplier = 1;
    let letterMultiplier = 1;
    let score = 0;

    for (const tile of tiles) {
        const bonus = premium.find(p => p.row === tile.row && p.col === tile.col);
        if (bonus) {
            switch (bonus.type) {
                case "triple word":
                    wordMultiplier *= 3;
                    break;
                case "double word":
                    wordMultiplier *= 2;
                    break;
                case "triple letter":
                    letterMultiplier = 3;
                    break;
                case "double letter":
                    letterMultiplier = 2
                    break;
            }
        }
        score += tile.cell.value * letterMultiplier;
        letterMultiplier = 1;
    }
    score *= wordMultiplier;

    if (tiles.length === MAX_LETTERS_COUNT) {
        score += BONUS;
    }

    return score;
}