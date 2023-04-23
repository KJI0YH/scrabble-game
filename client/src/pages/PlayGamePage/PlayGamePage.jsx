import { useEffect, useState } from "react";
import Board from "../../components/Board/Board";
import { playGameSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import ActiveLetters from "../../components/ActiveLetters/ActiveLetters";
import Player from "../../components/Player/Player";

function PlayGamePage() {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [playerLetters, setPlayerLetters] = useState([]);
    const [oldLetters, setOldLetters] = useState([]);
    const [newLetters, setNewLetters] = useState([]);
    const [players, setPlayers] = useState([]);
    const [input, setInput] = useState({
        row: -1,
        col: -1,
        horizontal: true,
    });

    const handleBoardCellClick = (event) => {
        const cell = event.target.closest('.board-cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if ((oldLetters && oldLetters.find(letter => letter.row === row && letter.col === col)) ||
                (newLetters && newLetters.find(letter => letter.row === row && letter.col === col))) {
                return;
            }
            setInput(prev => {
                return {
                    row: row,
                    col: col,
                    horizontal: (row === prev.row && col === prev.col) ? !(prev.horizontal) : true,
                }
            });
        }
    };

    function nextInput(input, size) {
        if (input.horizontal) {
            input.col++;
            while (((oldLetters && oldLetters.find(letter => letter.col === input.col && letter.row === letter.row)) ||
                (newLetters && newLetters.find(letter => letter.col === input.col && letter.row === input.row))) &&
                input.col <= size) {
                input.col++;
            }
        } else {
            input.row++;
            while (((oldLetters && oldLetters.find(letter => letter.col === input.col && letter.row === letter.row)) ||
                (newLetters && newLetters.find(letter => letter.col === input.col && letter.row === input.row))) &&
                input.col <= size) {
                input.row++;
            }
        }

        input.row = input.row < size ? input.row : -1;
        input.col = input.col < size ? input.col : -1;
        return input;
    };

    const handleActiveLetterClick = (event) => {
        if (input.row >= 0 && input.row < game.board.size &&
            input.col >= 0 && input.col < game.board.size) {
            const cell = event.target.closest('.tile');
            if (cell && !cell.classList.contains('selected')) {
                cell.classList.add('selected');
                if (cell) {
                    const letter = cell.dataset.letter;
                    const value = cell.dataset.value;
                    const newLetter = {
                        cell: {
                            letter: letter,
                            value: value,
                        },
                        row: input.row,
                        col: input.col,
                    }
                    setNewLetters(prev => [
                        ...prev,
                        newLetter,
                    ]);

                    const newInput = nextInput(input, game.board.size);
                    setInput(newInput);
                }
            }
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
            setPlayerLetters(game.players.find(player => player.login === playGameSocket.login).letters);
            setPlayers(game.players);
            setOldLetters(game.board.letters);
        });

        playGameSocket.on('timer tick', ({ login, timeLeft }) => {
            setPlayers(prevPlayers => {
                const updatedPlayers = prevPlayers.map(player => {
                    if (player.login === login) {
                        return {
                            ...player,
                            timeLeft: timeLeft
                        };
                    }
                    return player;
                });
                return updatedPlayers;
            });
        });

        return () => {
            playGameSocket.off('game state');
            playGameSocket.off('timer tick');
        }
    }, []);

    return (
        <div>
            {game && playerLetters && players && (
                <>
                    <Board
                        rowCount={game.board.size}
                        colCount={game.board.size}
                        premium={game.board.premium}
                        oldLetters={oldLetters}
                        newLetters={newLetters}
                        onClick={handleBoardCellClick}
                        input={input}
                    />

                    <ActiveLetters
                        letters={playerLetters}
                        onClick={handleActiveLetterClick}
                    />

                    {players.map(player => (
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