import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gameSocket } from "../../socket";

function WaitGamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [room, setRoom] = useState(location.state.room);

    useEffect(() => {
        if (!gameSocket.connected) {
            const token = localStorage.getItem('token');
            if (token) {
                gameSocket.auth = { token };
                gameSocket.connect();
            } else {
                navigate('/login', { replace: true });
            }
        }

        gameSocket.on('user joined', ({ message, room }) => {
            console.log(message);
            setRoom(room);
        });

        gameSocket.on('user left', ({ message, room }) => {
            console.log(message);
            setRoom(room);
        });

        gameSocket.on('game canceled', () => {
            navigate('/', { replace: true });
        });

        gameSocket.on('game started', ({ game }) => {
            navigate('/game', { replace: true, state: { game: game } });
        });

        return () => {
            gameSocket.off('user joined');
            gameSocket.off('user left');
            gameSocket.off('game canceled');
            gameSocket.off('game started');
            // gameSocket.disconnect();
        }
    }, []);

    function handleStartGame() {
        gameSocket.emit('start game', { id: room._id });
    }

    function handleLeaveGame() {
        gameSocket.emit('leave game', { id: room._id });
        navigate('/', { replace: true });
    }

    return (
        <div>
            <p>Room name: {room.name}</p>
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