import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gameSocket } from "../../socket";

function WaitGamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [room, setRoom] = useState(location.state.room);

    useEffect(() => {
        gameSocket.on('user joined', ({ message, users }) => {
            console.log(message);
            const newRoom = { ...room };
            newRoom.players = users;
            setRoom(newRoom);
        });

        gameSocket.on('user leave', ({ message, users }) => {
            console.log(message);
            const newRoom = { ...room };
            newRoom.players = users;
            setRoom(newRoom);
        });

        gameSocket.on('game started', () => {

        });

        return () => {
            gameSocket.off('user joined');
            gameSocket.off('user leave');
            // gameSocket.disconnect();
        }
    }, []);

    function handleStartGame() {
        gameSocket.emit('start game');
    }

    return (
        <div>
            <p>Room name: {room.roomName}</p>
            <p>Language: {room.language}</p>
            <p>Minutes per player: {room.minutesPerPlayer}</p>
            <p>Creator: {room.creator}</p>
            <p>Players: </p>
            <ul>
                {room.players.map((user) => (
                    <li key={user}>{user}</li>
                ))}
            </ul>
            {gameSocket.login === room.creator && (
                <button onClick={handleStartGame}>Start game</button>
            )}
        </div>
    );
}

export default WaitGamePage;