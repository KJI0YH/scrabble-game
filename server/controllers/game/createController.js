import { findGameNamespace } from "../../app.js";
import db from "../../database/db.js";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../../middlewares/auth.js";
import { getActiveRooms } from "./findController.js";
import { MAX_LETTERS_COUNT, getLetters } from "./playController.js";

export default function createController(createNamespace) {

    createNamespace.use(authenticateToken);

    createNamespace.on('connection', async (socket) => {

        console.log(`User ${socket.login} connected to game/create socket`);

        socket.emit('session', {
            login: socket.login,
            userID: socket.userID,
        });

        // Check existing room
        const createdRoom = await checkExistRoom(socket.login);
        if (createdRoom) {
            socket.emit('create success');
        }

        // Creating a wait room
        socket.on('create game', async ({ language, minutesPerPlayer, roomName }) => {

            // Check existing room
            const existRoom = await checkExistRoom(socket.login);
            if (existRoom) {
                return socket.emit('create success');
            }

            // Create new room object
            const room = {
                players: [socket.login],
                name: roomName,
                language: language,
                minutesPerPlayer: minutesPerPlayer,
                creator: socket.login,
            }
            await db.collection('rooms').insertOne(room);

            socket.emit('create success');

            // Update active rooms
            const activeRooms = await getActiveRooms();
            findGameNamespace.emit('active rooms', { activeRooms: activeRooms });
        });
    });
}

export async function createParty(id) {
    const roomID = new ObjectId(id);

    // Find active room with provided id
    const room = await db.collection('rooms').findOne({ _id: roomID });

    // Delete active room
    await db.collection('rooms').deleteOne({ _id: roomID });

    // Notify about active rooms
    const activeRooms = await getActiveRooms();
    findGameNamespace.emit('active rooms', { activeRooms: activeRooms });

    // Get letters bag for party
    const bag = await db.collection('bags').findOne({ language: { $regex: new RegExp(`^${room.language}$`, 'i') } });

    // Get board object for this party (TODO choosing of the board)
    const board = await db.collection('boards').findOne({ name: "classic" });

    // Create party object
    const party = {
        lang: bag.lang,
        status: "running",
        players: [],
        history: [],
        bag: bag.letters,
        board: {
            size: board.size,
            premium: board.premium,
            cells: [],
        }
    }

    // Create players objects
    for (const player of room.players) {
        const user = await db.collection('users').findOne({ login: player });
        if (user) {
            party.players.push({
                id: user._id,
                login: user.login,
                score: 0,
                timeLeft: room.minutesPerPlayer * 60,
                skip: false,

                // Get start letters for player
                letters: getLetters(MAX_LETTERS_COUNT, party.bag),
            });
        }
    }

    // Create a new party
    await db.collection('parties').insertOne(party);
}

async function checkExistRoom(login) {
    const existRoom = await db.collection('rooms').findOne({ creator: login });
    if (existRoom) {
        return existRoom;
    }
}
