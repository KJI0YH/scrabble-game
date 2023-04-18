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

        gameSocket.on('user left', ({ message, users }) => {
            console.log(message);
            const newRoom = { ...room };
            newRoom.players = users;
            setRoom(newRoom);
        });

        gameSocket.on('game canceled', () => {
            navigate('/', { replace: true });
        });

        gameSocket.on('game started', () => {

        });

        return () => {
            gameSocket.off('user joined');
            gameSocket.off('user left');
            // gameSocket.emit('leave game', { id: room.id });
            // gameSocket.disconnect();
        }
    }, []);

    function handleStartGame() {
        gameSocket.emit('start game');
    }

    function handleLeaveGame() {
        gameSocket.emit('leave game', { id: room.id });
        navigate('/', { replace: true });
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
            <button onClick={handleLeaveGame}>{gameSocket.login === room.creator ? 'Cancel game' : 'Leave game'}</button>
        </div>
    );
}

export default WaitGamePage;