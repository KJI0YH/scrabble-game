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
import PlayerModal from '../../components/PlayerModal/PlayerModal';
import Timer from '../../components/Timer/Timer';
import GameOverModal from '../../components/GameOverModal/GameOverModal';
import History from '../../components/History/History';
import axios from 'axios';
import { config } from '../../config';
const STAT_URL = `${config.SERVER_URL}:${config.API_PORT}/api/user/`;

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
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [endGameRequest, setEndGameRequest] = useState(false);
    const [playerStat, setPlayerStat] = useState(null);

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

            players.find(p => p.login === login).move = true;
            setPlayers(players);
        });

        playGameSocket.on('challenge tick', ({ player, initiator, score, letters, timeLeft }) => {
            setChallenge({
                player: player,
                initiator: initiator,
                score: score,
                letters: letters,
                timeLeft: timeLeft,
            });
            if (player === playGameSocket.login) {
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

    const handleCancel = (event) => {
        setNewLetters([]);
        setInput(defaultInput);
        const cells = document.querySelectorAll('.tile');
        cells.forEach(cell => {
            cell.classList.remove('selected');
        });
    }

    const handlePlayerClick = async (event) => {
        const player = event.target.closest('.player-click');
        if (player) {
            try {

                const response = await axios.get(`${STAT_URL}${player.dataset.id}`);
                setPlayerStat(response.data.user);
                setShowPlayerModal(true);
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className='play-container'>
            {game && playerLetters && players && (
                <>
                    <div className='play-controller'>
                        <div className='play-board'>
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
                        </div>

                        {challenge && resolveLetters.length > 0 ? (
                            <div className='play-controller-buttons'>
                                <button onClick={handleChallengeCancel} style={{ backgroundColor: '#e79029' }}>Cancel selection</button>
                                <button onClick={handleChallengeClose} style={{ backgroundColor: '#6aa061' }}>Resolve challenge</button>
                            </div>

                        ) : (
                            <>
                                <div className='play-controller-active'>
                                    < ActiveLetters
                                        letters={playerLetters}
                                        onClick={handleActiveLetterClick}
                                    />
                                </div>

                                {challenge ? (
                                    <div className='challenge-timer'>
                                        <Timer
                                            caption={"Challenge time left: "}
                                            seconds={challenge.timeLeft}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className='play-controller-buttons'>
                                            <button onClick={handleCancel} style={{ backgroundColor: '#e79029' }}>Cancel</button>
                                            <button onClick={handleSubmit} style={{ backgroundColor: '#6aa061' }}>Submit</button>
                                        </div>

                                        <div className='play-controller-buttons'>
                                            <button onClick={() => setShowLeaveModal(true)} style={{ backgroundColor: '#f44336' }}>Leave</button>
                                            {endGameRequest ? (
                                                <button onClick={handleEndGameDecline} style={{ backgroundColor: '#6aa061' }}>Decline</button>
                                            ) : (
                                                <button onClick={handleEndGameRequest} style={{ backgroundColor: '#e79029' }}>Finish</button>
                                            )}
                                            <button onClick={handleChallengeOpen} style={{ backgroundColor: '#e79029' }}>Challenge</button>
                                            <button onClick={() => { canMove && setShowSkipModal(true) }} style={{ backgroundColor: '#af7d88' }}>Skip</button>
                                            <button onClick={() => { canMove && setShowSwapModal(true) }} style={{ backgroundColor: '#af7d88' }}>Swap</button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className='play-info'>
                        <div className='players-info'>
                            <div className='players-header'>
                                <div>
                                    Players
                                </div>
                                <div>
                                    Active: {players.filter(p => p.timeLeft > 0).length}
                                </div>
                            </div>
                            <div className='players-container'>
                                {players.sort((a, b) => a.login.localeCompare(b.login)).map(player => (
                                    <div className='player-click' data-id={player.id} onClick={handlePlayerClick}>
                                        <Player
                                            player={player}
                                            challenge={challenge && challenge.player === player.login}
                                            initiator={challenge && challenge.initiator === player.login}
                                        />
                                    </div >
                                ))}
                            </div>
                        </div>

                        <TileBag
                            tiles={game.bag}
                        />

                        <History
                            history={game.history}
                        />
                    </div>

                    <PlayerModal
                        visible={showPlayerModal}
                        onCancel={() => setShowPlayerModal(false)}
                        statistics={playerStat}
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
            )}
        </div>
    )
}

export default PlayGamePage;