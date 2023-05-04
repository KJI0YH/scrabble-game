import './PlayGamePage.css';
import { useEffect, useState } from "react";
import Board from "../../components/Board/Board";
import { playGameSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import ActiveLetters from "../../components/ActiveLetters/ActiveLetters";
import Player from "../../components/Player/Player";
import TileBag from "../../components/TileBag/TileBag";
import SkipModal from "../../components/SkipModal/SkipModal";
import SwapModal from "../../components/SwapModal/SwapModal";
import LeaveModal from '../../components/LeaveModal/LeaveModal';
import Timer from '../../components/Timer/Timer';
import GameOverModal from '../../components/GameOverModal/GameOverModal';

const defaultInput = {
    row: -1,
    col: -1,
    horizontal: true,
}

function PlayGamePage() {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [playerLetters, setPlayerLetters] = useState([]);
    const [oldLetters, setOldLetters] = useState([]);
    const [newLetters, setNewLetters] = useState([]);
    const [players, setPlayers] = useState([]);
    const [canMove, setCanMove] = useState(false);
    const [input, setInput] = useState(defaultInput);

    const [showSkipModal, setShowSkipModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [endGameRequest, setEndGameRequest] = useState(false);

    const [challenge, setChallenge] = useState(null);
    const [resolveLetters, setResolveLetters] = useState([]);

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
            setOldLetters(game.board.cells);
            setNewLetters([]);

            // Set default input
            setInput(defaultInput);

            // Unselect all tiles
            document.querySelectorAll('.tile').forEach(tile => tile.classList.remove('selected'));
        });

        playGameSocket.on('timer tick', ({ login, timeLeft, players }) => {
            if (playGameSocket.login === login) {
                setCanMove(true);
            } else {
                setCanMove(false);
            }
            setChallenge(null);
            setResolveLetters([]);

            setPlayers(players);
        });

        playGameSocket.on('challenge tick', ({ player, initiator, score, letters, timeLeft }) => {
            if (player === playGameSocket.login) {
                setChallenge({
                    player: player,
                    initiator: initiator,
                    score: score,
                    letters: letters,
                    timeLeft: timeLeft,
                });
                setResolveLetters(prev => {
                    letters.map(letter => {
                        if (!prev.find(p => p.col === letter.col && p.row === letter.row)) {
                            prev.push(letter);
                        }
                    });
                    return prev;
                });
            }
        });

        playGameSocket.on('game over', ({ players }) => {
            setPlayers(players);
            setShowGameOverModal(true);
        });

        return () => {
            playGameSocket.off('game state');
            playGameSocket.off('timer tick');
            playGameSocket.off('challenge tick');
            playGameSocket.off('game over');
        }
    }, []);

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
            while (((oldLetters && oldLetters.find(letter => letter.col === input.col && letter.row === input.row)) ||
                (newLetters && newLetters.find(letter => letter.col === input.col && letter.row === input.row))) &&
                input.col <= size) {
                input.col++;
            }
        } else {
            input.row++;
            while (((oldLetters && oldLetters.find(letter => letter.col === input.col && letter.row === input.row)) ||
                (newLetters && newLetters.find(letter => letter.col === input.col && letter.row === input.row))) &&
                input.row <= size) {
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
                const letter = cell.dataset.letter;
                const value = parseInt(cell.dataset.value);
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
    };

    const handleChallengeSelect = (event) => {
        if (challenge) {
            const cell = event.target.closest('.board-cell');
            if (cell) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                const letter = oldLetters && oldLetters.find(letter => letter.row === row && letter.col === col)
                if (letter) {
                    setResolveLetters(prev => [
                        ...prev,
                        letter,
                    ]);
                }
            }
        }
    }

    const handleChallengeCancel = () => {
        if (challenge) {
            setResolveLetters(challenge.letters);
        }
    }

    const handleSubmit = () => {
        if (canMove && newLetters.length > 0) {
            playGameSocket.emit('move submit', { id: game._id, letters: newLetters });
        }
    }

    const handleSkip = () => {
        if (canMove) {
            playGameSocket.emit('move skip', { id: game._id });
            setShowSkipModal(false);
        }
    }

    const handleSwap = (letters) => {
        if (canMove) {
            playGameSocket.emit('move swap', { id: game._id, letters: letters });
            setShowSwapModal(false);
        }
    }

    const handleChallengeOpen = () => {
        playGameSocket.emit('challenge open', { id: game._id });
    }

    const handleChallengeClose = () => {
        playGameSocket.emit('challenge close', { id: game._id, letters: resolveLetters });
    }

    const handleLeave = () => {
        playGameSocket.emit('leave party', { id: game._id });
        setShowLeaveModal(false);
        navigate('/', { replace: true });
    }

    const handleGoHome = () => {
        setShowGameOverModal(false);
        playGameSocket.disconnect();
        navigate("/", { replace: true });
    }

    const handleEndGameRequest = () => {
        playGameSocket.emit('game end request', { id: game._id });
        setEndGameRequest(true);
    }

    const handleEndGameDecline = () => {
        playGameSocket.emit('game end decline', { id: game._id });
        setEndGameRequest(false);
    }

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
                        resolveLetters={resolveLetters}
                        onClick={handleBoardCellClick}
                        onMouseDown={handleChallengeSelect}
                        input={input}
                    />

                    {challenge ? (
                        <>
                            <Timer
                                caption={"Challenge time left: "}
                                seconds={challenge.timeLeft}
                            />
                            <button onClick={handleChallengeClose}>Resolve challenge</button>
                            <button onClick={handleChallengeCancel}>Cancel selection</button>
                        </>
                    ) : (
                        <>
                            < ActiveLetters
                                letters={playerLetters}
                                onClick={handleActiveLetterClick}
                            />

                            <button onClick={handleSubmit}>Submit</button>
                            <button onClick={() => { canMove && setShowSkipModal(true) }}>Skip</button>
                            <button onClick={() => { canMove && setShowSwapModal(true) }}>Swap</button>
                            <button onClick={handleChallengeOpen}>Challenge</button>
                            <button onClick={() => setShowLeaveModal(true)}>Leave</button>
                            {endGameRequest ? (
                                <button onClick={handleEndGameDecline}>Decline</button>
                            ) : (
                                <button onClick={handleEndGameRequest}>End game request</button>
                            )}

                        </>
                    )}

                    {players.map(player => (
                        <Player
                            player={player}
                        />
                    ))}

                    <TileBag
                        tiles={game.bag}
                    />

                    <SkipModal
                        visible={showSkipModal}
                        onClick={handleSkip}
                        onCancel={() => setShowSkipModal(false)}
                    />

                    <SwapModal
                        visible={showSwapModal}
                        letters={playerLetters}
                        onClick={handleSwap}
                        onCancel={() => setShowSwapModal(false)}
                    />

                    <LeaveModal
                        visible={showLeaveModal}
                        onClick={handleLeave}
                        onCancel={() => setShowLeaveModal(false)}
                    />

                    <GameOverModal
                        visible={showGameOverModal}
                        players={players}
                        onGoHome={handleGoHome}
                    />
                </>
            )
            }
        </div >
    )
}

export default PlayGamePage;