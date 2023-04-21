import { authenticateToken } from "../../middlewares/auth.js";
import db from "../../database/db.js";
import { ObjectId } from "mongodb";

const MAX_LETTERS_COUNT = 7;

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
                        timeLeft: room.minutesPerPlayer,
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
                    state: [],
                },
                history: [],
            };

            const inserted = await db.collection('games').insertOne(game);
            gameNamespace.to(id).emit('game started', { game: game });

            console.log(`User ${socket.login} start the game ${room.name}`);
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.login} disconnected from game socket`);
        });

    });
}

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