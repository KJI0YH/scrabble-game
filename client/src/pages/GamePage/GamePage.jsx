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
    const [input, setInput] = useState({
        row: -1,
        col: -1,
        horizontal: true,
    });

    const handleCellClick = (event) => {
        const cell = event.target.closest('.board-cell');
        if (cell) {
            const row = cell.dataset.row;
            const col = cell.dataset.col;
            setInput(prevInput => {
                return {
                    row: row,
                    col: col,
                    horizontal: (row === prevInput.row && col === prevInput.col) ? !(prevInput.horizontal) : true,
                }
            });
        }
    }

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
                onCellClick={handleCellClick}
                input={input}
            />

            <ActiveLetters
                letters={letters}
            />
        </div>
    )
}

export default GamePage;