import ActiveLetters from '../ActiveLetters/ActiveLetters';
import './Player.css';
import axios from 'axios';

function Player(props) {
    const { player } = props;

    const handlePlayerClick = async () => {
        const response = await axios.get(`http://localhost:8080/api/user/${player.id}`);
        console.log(response);
    };

    return (
        <div className="player-container" onClick={handlePlayerClick}>
            <div className="player-login">
                Login: {player.login}
            </div>
            <div className="player-score">
                Score: {player.score}
            </div>
            <div className='player-time'>
                Time left: {player.timeLeft}
            </div>
            <ActiveLetters
                letters={player.letters}
            />
        </div>
    );
}

export default Player;