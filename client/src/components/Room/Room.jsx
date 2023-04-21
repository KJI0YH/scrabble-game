import { findGameSocket } from '../../socket';
import './Room.css';
import React, { useEffect } from 'react';

function Room(props) {
    const { room, onJoin } = props;

    return (
        <div data-id={room._id} key={room._id} className="room-card">
            <h3>{room.name}</h3>
            <p>Language: {room.language}</p> <br />
            <p>Minutes per player: {room.minutesPerPlayer}</p> <br />
            <p>Creator: {room.creator}</p>
            <br />Players
            <ul>
                {room.players.map((player) => (
                    <li key={player}>{player}</li>
                ))}
            </ul>
            <button onClick={onJoin}>Join</button>
        </div>
    );
}

export default Room;