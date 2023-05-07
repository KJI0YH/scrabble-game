import React, { useState, useEffect } from 'react';
import { findGameSocket, playGameSocket } from '../../socket';
import { useNavigate } from 'react-router-dom';
import Room from '../../components/Room/Room';
import './FindGamePage.css';
import Swal from 'sweetalert2'

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
            Swal.fire({
                title: "Join error",
                text: message,
                icon: 'error',
                background: '#f44336',
                color: 'white',
                iconColor: 'white'
            });
        });

        findGameSocket.on('join success', () => {
            navigate('/game/wait', { replace: true });
        });

        return () => {
            findGameSocket.off('active party');
            findGameSocket.off('active rooms');
            findGameSocket.off('join error');
            findGameSocket.off('join success');
            findGameSocket.disconnect();
        }

    }, []);

    const handleJoin = (event) => {
        const room = event.target.closest('.room-container');
        if (room) {
            console.log(room.dataset.id);
            findGameSocket.emit('join game', { id: room.dataset.id });
        }
    }

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className='find-container'>
            <div className='find-content'>
                <div className='find-header'>Active rooms</div>
                <div className='rooms-container'>
                    {rooms && rooms.map((room) => (
                        <Room
                            room={room}
                            onJoin={handleJoin}
                        />
                    ))}
                </div>
                <div className='find-buttons'>
                    <button onClick={handleBack}>Back</button>
                </div>
            </div>
        </div>
    );
}

export default FindGamePage;