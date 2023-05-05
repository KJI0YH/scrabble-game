import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameSocket } from '../../socket';
import './CreateGamePage.css';

function CreateGamePage() {
    const [language, setLanguage] = useState('English');
    const [minutesPerPlayer, setMinutesPerPlayer] = useState(15);
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [roomName, setRoomName] = useState("");
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

        createGameSocket.on('active party', ({ party }) => {
            navigate('/game/play', { replace: true });
        });

        createGameSocket.on('create error', ({ message }) => {
            console.log(message);
        });

        createGameSocket.on('create success', () => {
            navigate('/game/wait', { replace: true });
        });

        return () => {
            createGameSocket.off('active party');
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

    const handleMaxPlayersChange = (e) => {
        setMaxPlayers(e.target.value);
    }

    const handleCreateGame = () => {
        createGameSocket.emit('create game',
            {
                language: language,
                minutesPerPlayer: minutesPerPlayer,
                roomName: roomName,
            });
    }

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className='create-container'>
            <div className='create-content'>
                <div className='create-header'>Create party</div>

                <div className='create-parameter'>
                    <input
                        type="text"
                        placeholder='Room name'
                        value={roomName}
                        onChange={handleRoomNameChange}
                    />
                </div>

                <div className='create-parameter'>
                    <label>Language:</label>
                    <select value={language} onChange={handleLanguageChange}>
                        <option value="English">English</option>
                        <option value="Russian">Russian</option>
                    </select>
                </div>

                <div className='create-parameter'>
                    <label>Minutes per player:</label>
                    <input
                        type="number"
                        value={minutesPerPlayer}
                        onChange={handleMinutesPerPlayerChange}
                        min={1}
                        max={60}
                    />
                </div>

                <div className='create-parameter'>
                    <label>Max number of players:</label>
                    <input
                        type="number"
                        value={maxPlayers}
                        onChange={handleMaxPlayersChange}
                        min={2}
                        max={4}
                    />
                </div>

                <div className='create-buttons'>
                    <button onClick={handleCreateGame}>Create Game</button>
                    <button onClick={handleBack}>Back</button>
                </div>
            </div>
        </div>
    );
}

export default CreateGamePage;