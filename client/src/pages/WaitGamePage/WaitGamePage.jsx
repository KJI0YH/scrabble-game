import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { waitGameSocket } from "../../socket";
import './WaitGamePage.css';

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
        <div className="wait-container">
            {room && (
                <div className="wait-content">
                    <div className="wait-header">Wait room</div>
                    <div className="wait-parameter">
                        Room name: <span>{room.name}</span>
                    </div>
                    <div className="wait-parameter">
                        Language: <span>{room.language}</span>
                    </div>
                    <div className="wait-parameter">
                        Minutes per player: <span>{room.minutesPerPlayer}</span>
                    </div>
                    <div className="wait-parameter">
                        Max number of players: <span>{room.maxPlayers}</span>
                    </div>
                    <div className="wait-parameter">
                        Creator: <span>{room.creator}</span>
                    </div>
                    <div className="wait-parameter">
                        Players:
                        <ul>
                            {room.players.map((player) => (
                                <div className="player">
                                    <li key={player}>{player}</li>
                                </div>
                            ))}
                        </ul>
                    </div>

                    <div className="wait-buttons">
                        {waitGameSocket.login === room.creator && (
                            <button onClick={handleStartGame}>Start game</button>
                        )}
                        <button onClick={handleLeaveGame}>{waitGameSocket.login === room.creator ? 'Cancel game' : 'Leave game'}</button>
                    </div>
                </div>
            )
            }
        </div >
    );
}

export default WaitGamePage;