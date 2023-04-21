import { useEffect, useState } from "react";
import Board from "../../components/Board/Board";
import { playGameSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ActiveLetters from "../../components/ActiveLetters/ActiveLetters";
import Player from "../../components/Player/Player";

function PlayGamePage() {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [letters, setLetters] = useState(null);
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
        if (!playGameSocket.connected) {
            const token = localStorage.getItem('token');
            if (token) {
                playGameSocket.auth = { token };
                playGameSocket.connect();
            } else {
                navigate('/login', { replace: true });
            }
        }

        playGameSocket.on('game state', ({ game }) => {
            setGame(game);
            setLetters(game.players.find(player => player.login === playGameSocket.login).letters);
        });

        return () => {
            playGameSocket.off('game state');
        }
    }, []);

    return (
        <div>
            {game && letters && (
                <>
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

                    {game.players.map(player => (
                        <Player
                            player={player}
                        />
                    ))}

                </>
            )}
        </div>
    )
}

export default PlayGamePage;