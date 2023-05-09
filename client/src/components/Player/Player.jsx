import Timer from '../Timer/Timer';
import './Player.css';
import React from 'react';

function Player(props) {
    const { player, challenge, initiator } = props;

    return (
        <div className="player-container"
            style={{
                ...(player.move && { borderColor: '#00FF00' }),
                ...(player.timeLeft === 0 && { borderColor: '#FF0000' })
            }}
        >
            <div className='player-header'>
                <div className="player-login">
                    {player.login}
                </div>
                {challenge && (
                    <div className='challenge'>
                        challenge
                    </div>
                )}
                {initiator && (
                    <div className='challenge'>
                        initiator
                    </div>
                )}
                {player.wantEnd && (
                    <div className='wants-to-end'>
                        finish
                    </div>
                )}
            </div>
            {/* <ActiveLetters
                letters={player.letters}
            /> */}
            <div className='player-info'>
                <div className="player-score">
                    {player.score}
                </div>
                <div className='player-timer'>
                    <Timer
                        seconds={player.timeLeft}
                    />
                </div>
            </div>
        </div>
    );
}

export default Player;