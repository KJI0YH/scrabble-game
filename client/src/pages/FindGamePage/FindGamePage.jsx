import React, { useState, useEffect } from 'react';
import { gameSocket } from '../../socket';
import { useNavigate } from 'react-router-dom';
import Room from '../../components/Room/Room';


function FindGamePage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            gameSocket.auth = { token };
            gameSocket.connect();
        }

        gameSocket.on('connect_error', (error) => {
            navigate('/login', { replace: true });
        });

        gameSocket.on('session', ({ login, userID }) => {
            gameSocket.login = login;
            gameSocket.userID = userID;
        });

        gameSocket.on('connect', () => {
            console.log(`Connected to server with socket ID: ${gameSocket.id}`);
        });

        gameSocket.on('active rooms', ({ activeRooms }) => {
            setRooms(activeRooms);
        });

        gameSocket.on('joined', ({ room }) => {
            navigate('/game/wait', { replace: false, state: { room: room } });
        });

        gameSocket.on('join error', ({ message }) => {
            console.log(message);
        });

        return () => {
            gameSocket.off('connect_error');
            gameSocket.off('session');
            gameSocket.off('active rooms');
            gameSocket.off('user joined');
            gameSocket.off('join error');
            // gameSocket.disconnect();
        }

    }, []);

    return (
        <div>
            <h2>Active Rooms</h2>
            <ul>
                {rooms.map((room) => (
                    <Room
                        room={room}
                    />
                ))}
            </ul>
        </div>
    );
}

export default FindGamePage;