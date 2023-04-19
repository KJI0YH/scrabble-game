import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameSocket } from '../../socket';

function CreateGamePage() {
    const [language, setLanguage] = useState('English');
    const [minutesPerPlayer, setMinutesPerPlayer] = useState(15);
    const [roomName, setRoomName] = useState('');
    const navigate = useNavigate();

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

        gameSocket.on('connect', () => {
            console.log(`Connected to server with socket ID: ${gameSocket.id}`);
        });

        gameSocket.on('create error', ({ message }) => {
            console.log(message);
        });

        gameSocket.on('game created', ({ room }) => {
            navigate('/game/wait', { replace: false, state: { room: room } });
        });

        return () => {
            gameSocket.off('connect');
            gameSocket.off('create error');
            gameSocket.off('game created');
        }

    }, []);

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleMinutesPerPlayerChange = (e) => {
        setMinutesPerPlayer(e.target.value);
    };

    const handleRoomNameChange = (e) => {
        setRoomName(e.target.value);
    }

    function handleCreateGame() {
        gameSocket.emit('create game',
            {
                roomName: roomName,
                language: language,
                minutesPerPlayer: minutesPerPlayer,
            });
    }

    return (
        <div>
            <h1>Create Game</h1>
            <label>
                Language:
                <select value={language} onChange={handleLanguageChange}>
                    <option value="English">English</option>
                    <option value="Russian">Russian</option>
                </select>
            </label>
            <br />
            <label>
                Minutes per player:
                <input type="number" value={minutesPerPlayer} onChange={handleMinutesPerPlayerChange} min={1} max={60} />
            </label>
            <br />
            <label>
                Room name:
                <input type="text" value={roomName} onChange={handleRoomNameChange} />
            </label>
            <button onClick={handleCreateGame}>Create Game</button>
        </div>
    );
}

export default CreateGamePage;