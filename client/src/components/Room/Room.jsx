import { findGameSocket } from '../../socket';
import './Room.css';
import React from 'react';

function Room(props) {
    const { room, onJoin } = props;

    return (
        <div data-id={room._id} key={room._id} className="room-container">
            <div className='room-content'>
                <div className='room-header'>
                    {room.name}
                </div>

                <div className='room-content-info'>
                    <div className='room-info-item'>
                        Creator:
                        <span>
                            {room.creator}
                        </span>

                    </div>
                    <div className='room-info-item'>
                        Language:
                        <span>
                            {room.language}
                        </span>
                    </div>
                    <div className='room-info-item'>
                        Minutes per player:
                        <span>
                            {room.minutesPerPlayer}
                        </span>
                    </div>
                    <div className='room-info-item'>
                        Max number of players:
                        <span>
                            {room.maxPlayers}
                        </span>
                    </div>
                </div>
                <div className='players-container'>
                    Players:
                    {room.players.map((player) => (
                        <div className='player' key={player}>{player}</div>
                    ))}
                </div>
                <button onClick={onJoin}>Join</button>
            </div>
        </div>
    );
}

export default Room;