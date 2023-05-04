import db from "../../database/db.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { validateWord } from "../../utils/wordsDictionary.js";
import { ObjectId } from "mongodb";

export const MAX_LETTERS_COUNT = 7;
const BONUS = 50;
const SECONDS_FOR_CHALLENGE = 60;

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
            const partyID = activeParty._id.toString();
            socket.join(partyID);
            socket.emit('game state', { game: activeParty });

            // Add game timer
            if (!roomTimers[partyID]) {
                roomTimers[partyID] = setInterval(async => {
                    timerTick(partyID, playNamespace)
                }, 1000);
            }
        }
        else {
            return socket.disconnect();
        }

        // Standart move, submit tiles, scoring and get new letters
        socket.on('move submit', async ({ id, letters }) => {

            // Check that player can move
            const nowMove = await nowPlayer(id);
            if (!(nowMove && nowMove.login == socket.login)) {
                return;
            }

            const partyID = new ObjectId(id)
            const party = await db.collection('parties').findOne({ _id: partyID });
            if (party) {

                // Get player from party
                const player = party.players.find(p => p.login === socket.login);

                // User letters verification
                const validLetters = validateLetters(player.letters, letters.map(letter => letter.cell));

                // Check validity of positions
                const validPosition = validateSubmit(letters, party.board);

                if (validLetters && validPosition) {
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
                    await db.collection('parties').updateOne({ _id: partyID }, {
                        $set: { "bag": party.bag },
                        $push: {
                            "board.cells": { $each: letters },
                            "history": history
                        },
                    });
                    await db.collection('parties').updateOne({ _id: partyID, "players.login": socket.login }, {
                        $set: { "players.$.letters": player.letters },
                        $inc: { "players.$.score": score }
                    });

                    // Passing the move to the next player
                    await nextPlayer(id);
                }

                const newState = await db.collection('parties').findOne({ _id: partyID });
                playNamespace.to(id).emit('game state', { game: newState });
            }
        });

        // Skipping witout replacing tiles
        socket.on('move skip', async ({ id }) => {

            // Check that player can move
            const nowMove = await nowPlayer(id);
            if (!(nowMove && nowMove.login == socket.login)) {
                return;
            }

            const partyID = new ObjectId(id);
            await nextPlayer(id);

            const history = {
                player: socket.login,
                timestamp: new Date(),
                type: 'skip',
            };

            await db.collection('parties').updateOne({ _id: partyID }, { $push: { "history": history } });

            const newState = await db.collection('parties').findOne({ _id: partyID });
            playNamespace.to(id).emit('game state', { game: newState });
        });

        // Skipping with replacing tiles
        socket.on('move swap', async ({ id, letters }) => {

            // Check that player can move
            const nowMove = await nowPlayer(id);
            if (!(nowMove && nowMove.login == socket.login)) {
                return;
            }

            const partyID = new ObjectId(id);
            const party = await db.collection('parties').findOne({ _id: partyID });
            if (party) {

                // Get player from party
                const player = party.players.find(p => p.login === socket.login);

                // User letters verification
                const valid = validateLetters(player.letters, letters);

                if (valid) {

                    // Update party history
                    const history = {
                        player: socket.login,
                        timestamp: new Date(),
                        type: 'swap',
                        letters: letters,
                    };
                    await db.collection('parties').updateOne({ _id: partyID }, { $push: { "history": history } });

                    // Return letters to the bag
                    await returnLetters(letters, party.bag);

                    // Get new letters for the player
                    const newLetters = getLetters(MAX_LETTERS_COUNT - player.letters.length, party.bag);
                    player.letters = player.letters.concat(newLetters);

                    // Making changes to the state of the party
                    await db.collection('parties').updateOne({ _id: partyID }, { $set: { "bag": party.bag } });
                    await db.collection('parties').updateOne({ _id: partyID, "players.login": socket.login }, { $set: { "players.$.letters": player.letters } });

                    // Passing the move to the next player
                    await nextPlayer(id);
                }

                const newState = await db.collection('parties').findOne({ _id: partyID });
                playNamespace.to(id).emit('game state', { game: newState });
            }
        });

        // Opennig challenge for the resolution of the word
        socket.on('challenge open', async ({ id }) => {
            const partyID = new ObjectId(id);
            const party = await db.collection('parties').findOne({ _id: partyID });
            if (party && party.status !== "challenge") {
                if (party.history.length === 0) {
                    return;
                }

                const lastSubmit = party.history.reduce((older, curr) => {
                    return curr.type === "submit" && curr.timestamp > older.timestamp ? curr : older;
                });

                if (!lastSubmit) {
                    return;
                }

                if (lastSubmit.player === socket.login) {
                    return;
                }

                const challenge = {
                    player: lastSubmit.player,
                    initiator: socket.login,
                    score: lastSubmit.score,
                    letters: lastSubmit.letters,
                    timeLeft: SECONDS_FOR_CHALLENGE,
                }

                await db.collection('parties').updateOne({ _id: partyID }, {
                    $set: {
                        "status": "challenge",
                        "challenge": challenge,
                    }
                });
            }
        });

        // Closing  challenge for the resolution of the word
        socket.on('challenge close', async ({ id, letters }) => {
            await closeChallenge(id, letters);
            const newState = await db.collection('parties').findOne({ _id: new ObjectId(id) });
            playNamespace.to(id).emit('game state', { game: newState });
        });

        // Leave from party
        socket.on('leave party', async ({ id }) => {
            const partyID = new ObjectId(id);
            const party = await db.collection('parties').findOne({ _id: partyID });
            if (party) {

                // Get player from party
                const player = party.players.find(p => p.login === socket.login);

                // Return player letters to the bag
                await returnLetters(player.letters, party.bag);

                const history = {
                    player: socket.login,
                    type: 'leave',
                    timestamp: new Date(),
                }

                // Last player leaves
                if (party.players.length === 1) {
                    // End of the game
                    await db.collection('parties').deleteOne({ _id: partyID });

                } else {
                    await db.collection('parties').updateOne({ _id: partyID }, {
                        $push: { "history": history },
                        $set: { "bag": party.bag },
                    });
                    await db.collection('parties').updateOne({ _id: partyID, "players.login": socket.login }, {
                        $set: {
                            "timeLeft": 0,
                            "letters": [],
                        }
                    });
                }
            }

            const newState = await db.collection('parties').findOne({ _id: partyID });
            playNamespace.to(id).emit('game state', { game: newState });
        });

        // Game end request. If all players wants end - game over
        socket.on('game end request', async ({ id }) => {
            const partyID = new ObjectId(id);
            const party = await db.collection('parties').findOne({ _id: partyID });
            if (party) {
                const player = party.players.find(p => p.login === socket.login);
                if (player && !player.wantEnd) {
                    player.wantEnd = true;

                    // Check end of the party
                    if (party.players.every(p => p.wantEnd)) {

                        await db.collection('parties').updateOne({ _id: partyID }, {
                            $set: {
                                "status": "end"
                            }
                        });
                    }

                    await db.collection('parties').updateOne({ _id: partyID, "players.login": socket.login }, {
                        $set: {
                            "players.$.wantEnd": true,
                        }
                    });
                }
            }
        });

        // Decline game end request
        socket.on('game end decline', async ({ id }) => {
            const partyID = new ObjectId(id);
            const party = await db.collection('parties').findOne({ _id: partyID });
            if (party) {
                const player = party.players.find(p => p.login === socket.login);
                if (player && player.wantEnd) {
                    await db.collection('parties').updateOne({ _id: partyID, "players.login": socket.login }, {
                        $set: {
                            "players.$.wantEnd": false,
                        }
                    })
                }
            }
        });
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

// Return letters to the bag
async function returnLetters(letters, bag) {
    await letters.map(letter => {
        const tile = bag.find(tile => tile.letter === letter.letter)
        if (tile) {
            tile.count++;
        }
    })
}

// Selection of the player who moves next
async function nextPlayer(id) {
    const partyID = new ObjectId(id);
    const party = await db.collection('parties').findOne({ _id: partyID });
    if (party) {
        const players = party.players;

        // End of the party all time is up
        if (!players.find(p => p.timeLeft > 0)) {
            return await db.collection('parties').updateOne({ _id: partyID }, {
                $set: { "status": "end" }
            });
        }

        do {
            const popPlayer = players.shift();
            popPlayer.skip = false;
            players.push(popPlayer);
        } while (players[0].skip || players[0].timeLeft <= 0);

        await db.collection('parties').updateOne({ _id: partyID }, {
            $set: { "players": players }
        });
    }
}

// Selecten of the player who move now
async function nowPlayer(id) {
    const partyID = new ObjectId(id);
    const party = await db.collection('parties').findOne({ _id: partyID });
    if (party && party.status === "running" && party.players.length > 0) {
        return party.players[0];
    }
    else {
        return null;
    }
}

// Validate user letters
function validateLetters(serverLetters, clientLetters) {
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
async function timerTick(id, playNamespace) {
    const partyID = new ObjectId(id);
    const party = await db.collection('parties').findOne({ _id: partyID });
    if (party) {

        switch (party.status) {
            case "running":
                let player = party.players[0];
                if (player.timeLeft > 0 && !player.skip) {

                    // Decrease player time
                    await db.collection('parties').updateOne({ _id: partyID }, {
                        $inc: { 'players.0.timeLeft': -1 }
                    });
                } else {
                    player = nextPlayer(id);
                }
                playNamespace.to(id).emit('timer tick', {
                    login: player.login,
                    timeLeft: Math.max(player.timeLeft - 1, 0),
                    players: party.players,
                });
                break;
            case "challenge":
                const challenge = party.challenge;

                if (challenge.timeLeft > 0) {

                    // Decrease challenge time
                    await db.collection('parties').updateOne({ _id: partyID }, {
                        $inc: { 'challenge.timeLeft': -1 }
                    });
                } else {

                    // Close challenge when time expired
                    await closeChallenge(id, []);
                    const newState = await db.collection('parties').findOne({ _id: partyID });
                    return playNamespace.to(id).emit('game state', { game: newState });
                }

                playNamespace.to(id).emit('challenge tick', {
                    player: challenge.player,
                    initiator: challenge.initiator,
                    timeLeft: challenge.timeLeft,
                    letters: challenge.letters,
                    score: challenge.score,
                });
                break;
            case "end":

                // Unset game timer
                if (roomTimers[id]) {
                    clearInterval(roomTimers[id]);
                }

                // Save to games history
                const game = {
                    players: party.players.map(player => {
                        return {
                            login: player.login,
                            score: player.score,
                        }
                    }),
                    history: party.history,
                    lang: party.lang,
                };
                await db.collection('games').insertOne(game);
                await db.collection('parties').deleteOne({ _id: partyID });

                // Notify users that game over
                playNamespace.to(id).emit('game over', { players: party.players });
                break;
        }
    }
}

// Check active party for player
export async function checkActiveParty(login) {
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

// Validate tiles from submit
function validateSubmit(tiles, board) {
    const isSameRow = tiles.every(t => t.row === tiles[0].row);
    const isSameCol = tiles.every(t => t.col === tiles[0].col);

    // Tiles are in different lines
    if (!(isSameRow || isSameCol)) {
        return false;
    }

    // Check initial position
    const initialPos = board.premium.find(p => p.type === "initial");

    // Check that initial tile is empty
    if (!board.cells.find(cell => cell.row === initialPos.row && cell.col === initialPos.col)) {

        // Initial tile must be filled
        if (tiles.find(tile => tile.row === initialPos.row && tile.col === initialPos.col)) {
            return true;
        }
        return false;
    }

    // Check the intersection with other tiles on one row
    if (isSameRow) {
        const row = tiles[0].row;
        const minCol = tiles.reduce((min, curr) => {
            return curr.col < min.col ? curr : min;
        }).col;
        const maxCol = tiles.reduce((max, curr) => {
            return curr.col > max.col ? curr : max;
        }).col;

        // Check tiles between word
        if (board.cells.find(cell => cell.row === row && cell.col > minCol && cell.col < maxCol)) {
            return true;
        }

        // Check tiles at the start of the word
        if (minCol > 0 && board.cells.find(cell => cell.row === row && cell.col === minCol - 1)) {
            return true;
        }

        // Check tiles at the end of the word
        if (maxCol < board.size && board.cells.find(cell => cell.row === row && cell.col === maxCol + 1)) {
            return true;
        }
    }

    // Check the intersection with other tiles on one col
    if (isSameCol) {
        const col = tiles[0].col;
        const minRow = tiles.reduce((min, curr) => {
            return curr.row < min.row ? curr : min;
        }).row;
        const maxRow = tiles.reduce((max, curr) => {
            return curr.row > max.row ? curr : max;
        }).row;

        // Check tiles between word
        if (board.cells.find(cell => cell.col === col && cell.row > minRow && cell.row < maxRow)) {
            return true;
        }

        // Check tiles at the start of the word
        if (minRow > 0 && board.cells.find(cell => cell.col === col && cell.row === minRow - 1)) {
            return true;
        }

        // Check tiles at the end of the word
        if (maxRow < board.size && board.cells.find(cell => cell.col === col && cell.row === maxRow + 1)) {
            return true;
        }

        return false;
    }
    return false;
}

// Validate tiles from challenge
async function validateChallenge(tiles, party) {

    const used = party.challenge.letters.every(old => tiles.some(tile =>
        old.row === tile.row &&
        old.col === tile.col &&
        old.cell.letter === tile.cell.letter &&
        old.cell.value === tile.cell.value));

    if (!used) {
        return false;
    }

    // Check that a word overlaps with another word
    if (party.board.cells.length !== 0 && party.challenge.letters.length === tiles.length) {
        return false;
    }

    const isSameRow = tiles.every(t => t.row === tiles[0].row);
    const isSameCol = tiles.every(t => t.col === tiles[0].col);

    // Tiles are in different lines
    if (!(isSameRow || isSameCol)) {
        return false;
    }

    if (isSameRow) {
        tiles.sort((a, b) => a.col - b.col);

        let prevCol = tiles[0].col;
        for (let i = 1; i < tiles.length; i++) {
            if (++prevCol !== tiles[i].col) {
                return false;
            }
        }
    }

    if (isSameCol) {
        tiles.sort((a, b) => a.row - b.row);

        let prevRow = tiles[0].row;
        for (let i = 1; i < tiles.length; i++) {
            if (++prevRow !== tiles[i].row) {
                return false;
            }
        }
    }

    // Validate word
    const word = tiles.map(tile => tile.cell.letter).join("");
    const result = await validateWord(word, party.lang);

    console.log(result);

    if (result) {
        return true;
    }
    return false;
}

// Closing opening challenge
async function closeChallenge(id, letters) {
    const partyID = new ObjectId(id);
    const party = await db.collection('parties').findOne({ _id: partyID });
    if (party && party.status === "challenge") {
        const player = party.players.find(p => p.login === party.challenge.player);
        const initiator = party.players.find(p => p.login === party.challenge.initiator);

        const validChallenge = await validateChallenge(letters, party);
        if (validChallenge) {

            // Initiator penalty
            initiator.skip = true;
        } else {

            // Player penalty
            player.score -= party.challenge.score;

            party.board.cells = party.board.cells.filter(c => !party.challenge.letters.some(l =>
                l.row === c.row &&
                l.col === c.col &&
                l.cell.letter === c.cell.letter &&
                l.cell.letter === c.cell.letter));
            await returnLetters(party.challenge.letters.map(letter => letter.cell), party.bag);
        }

        // Update party state
        await db.collection('parties').updateOne({ _id: partyID }, {
            $set: {
                "status": "running",
                "bag": party.bag,
                "players": party.players,
                "board.cells": party.board.cells,
            },
            $unset: {
                "challenge": "",
            }
        });
    }
}