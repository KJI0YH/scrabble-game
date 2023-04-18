import { gameSocket } from '../../socket';
import './Room.css';
import React, { useEffect } from 'react';

function Room(props) {
    const room = props.room;

    function handleJoin() {
        console.log(room);
        gameSocket.emit('join game', { id: room.id });
    }

    return (
        <div key={room.id} className="room-card">
            <h3>{room.roomName}</h3>
            <text>Language: {room.language}</text> <br />
            <text>Minutes per player: {room.minutesPerPlayer}</text> <br />
            <text>Creator: {room.creator}</text>
            <br />Players
            <ul>
                {room.players.map((player) => (
                    <li key={player}>{player}</li>
                ))}
            </ul>
            <button onClick={handleJoin}>Join</button>
        </div>
    );
}

export default Room;