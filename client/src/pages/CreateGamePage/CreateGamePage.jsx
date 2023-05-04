import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameSocket } from '../../socket';

function CreateGamePage() {
    const [language, setLanguage] = useState('English');
    const [minutesPerPlayer, setMinutesPerPlayer] = useState(15);
    const [roomName, setRoomName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {

        if (!createGameSocket.connected) {
            const token = localStorage.getItem('token');
            if (token) {
                createGameSocket.auth = { token };
                createGameSocket.connect();
            } else {
                navigate('/login', { replace: true });
            }
        }

        createGameSocket.on('create error', ({ message }) => {
            console.log(message);
        });

        createGameSocket.on('create success', () => {
            navigate('/game/wait', { replace: true });
        });

        return () => {
            createGameSocket.off('create error');
            createGameSocket.off('create success');
            createGameSocket.disconnect();
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
        createGameSocket.emit('create game',
            {
                language: language,
                minutesPerPlayer: minutesPerPlayer,
                roomName: roomName,
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