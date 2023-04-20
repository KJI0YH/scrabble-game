import { useEffect, useState } from "react";
import Board from "../../components/Board/Board";
import { gameSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ActiveLetters from "../../components/ActiveLetters/ActiveLetters";

function GamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [game, setGame] = useState(location.state.game);
    const [letters, setLetters] = useState(game.players.find(player => player.login === gameSocket.login).letters);

    useEffect(() => {
        if (!gameSocket.connected) {
            const token = localStorage.getItem('token');
            if (token) {
                gameSocket.auth = { token };
                gameSocket.connect();
            } else {
                navigate('/login', { replace: true });
            }
        }

        return () => {

        }

    }, []);

    return (
        <div>
            <Board
                rowCount={game.board.size}
                colCount={game.board.size}
                premium={game.board.premium}
            />

            <ActiveLetters
                letters={letters}
            />
        </div>
    )
}

export default GamePage;