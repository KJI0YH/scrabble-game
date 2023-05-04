import ActiveLetters from '../ActiveLetters/ActiveLetters';
import Timer from '../Timer/Timer';
import './Player.css';
import axios from 'axios';

function Player(props) {
    const { player } = props;

    const handlePlayerClick = async () => {
        const response = await axios.get(`http://localhost:8080/api/user/${player.id}`);
        console.log(response);
    };

    return (
        <div className="player-container"
            onClick={handlePlayerClick}
            style={{ backgroundColor: player.wantEnd ? '#FFFF00' : '#FFFFFF' }}
        >
            <div className="player-login">
                Login: {player.login}
            </div>
            <div className="player-score">
                Score: {player.score}
            </div>
            <Timer
                caption="Time left: "
                seconds={player.timeLeft}
            />
            <ActiveLetters
                letters={player.letters}
            />
        </div>
    );
}

export default Player;