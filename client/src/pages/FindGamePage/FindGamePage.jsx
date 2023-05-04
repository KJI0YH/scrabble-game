import React, { useState, useEffect } from 'react';
import { findGameSocket, playGameSocket } from '../../socket';
import { useNavigate } from 'react-router-dom';
import Room from '../../components/Room/Room';
import LeaveModal from '../../components/LeaveModal/LeaveModal';


function FindGamePage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState(null);

    useEffect(() => {
        if (!findGameSocket.connected) {
            const token = localStorage.getItem('token');
            if (token) {
                findGameSocket.auth = { token };
                findGameSocket.connect();
                findGameSocket.emit('active rooms');
            } else {
                navigate('/login', { replace: true });
            }
        }

        findGameSocket.on('active party', ({ party }) => {
            navigate('/game/play', { replace: true });
        });


        findGameSocket.on('active rooms', ({ activeRooms }) => {
            setRooms(activeRooms);
        });

        findGameSocket.on('join error', ({ message }) => {

        });

        findGameSocket.on('join success', () => {
            navigate('/game/wait', { replace: true });
        });

        return () => {
            findGameSocket.off('active party');
            findGameSocket.off('active rooms');
            findGameSocket.off('join error');
            findGameSocket.off('join success');
        }

    }, []);

    const handleJoin = (event) => {
        const room = event.target.closest('.room-card');
        if (room) {
            console.log(room.dataset.id);
            findGameSocket.emit('join game', { id: room.dataset.id });
        }
    }

    return (
        <div>
            <h2>Active Rooms</h2>
            <ul>
                {rooms && rooms.map((room) => (
                    <Room
                        room={room}
                        onJoin={handleJoin}
                    />
                ))}
            </ul>
        </div>
    );
}

export default FindGamePage;