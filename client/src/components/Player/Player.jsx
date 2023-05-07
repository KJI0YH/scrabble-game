import ActiveLetters from '../ActiveLetters/ActiveLetters';
import Timer from '../Timer/Timer';
import './Player.css';
import axios from 'axios';

function Player(props) {
    const { player, challenge, initiator } = props;

    const handlePlayerClick = async () => {
        const response = await axios.get(`http://localhost:8080/api/user/${player.id}`);
        console.log(response);
    };

    return (
        <div className="player-container"
            onClick={handlePlayerClick}
            style={{
                ...(player.move && { borderColor: 'green' }),
                ...(player.timeLeft === 0 && { borderColor: 'red' })
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