import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { waitGameSocket } from "../../socket";

function WaitGamePage() {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

    useEffect(() => {
        if (!waitGameSocket.connected) {
            const token = localStorage.getItem('token');
            if (token) {
                waitGameSocket.auth = { token };
                waitGameSocket.connect();
            } else {
                navigate('/login', { replace: true });
            }
        }

        waitGameSocket.on('active party', ({ party }) => {
            navigate('/game/play', { replace: true });
        });

        waitGameSocket.on('user joined', ({ room }) => {
            setRoom(room);
        });

        waitGameSocket.on('user left', ({ room }) => {
            setRoom(room);
        });

        waitGameSocket.on('game canceled', () => {
            navigate('/', { replace: true });
        });

        waitGameSocket.on('game started', () => {
            navigate('/game/play', { replace: true });
        });

        return () => {
            waitGameSocket.off('active party');
            waitGameSocket.off('user joined');
            waitGameSocket.off('user left');
            waitGameSocket.off('game canceled');
            waitGameSocket.off('game started');
            waitGameSocket.disconnect();
        }
    }, []);

    function handleStartGame() {
        waitGameSocket.emit('start game', { id: room._id });
    }

    function handleLeaveGame() {
        waitGameSocket.emit('leave game', { id: room._id });
        navigate('/', { replace: true });
    }

    return (
        <div>
            {room && (
                <>
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
                    {waitGameSocket.login === room.creator && (
                        <button onClick={handleStartGame}>Start game</button>
                    )}
                    <button onClick={handleLeaveGame}>{waitGameSocket.login === room.creator ? 'Cancel game' : 'Leave game'}</button>
                </>
            )}
        </div>
    );
}

export default WaitGamePage;