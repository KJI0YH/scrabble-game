import './GameOverModal.css';

function GameOverModal(props) {
    const { visible, players, onGoHome } = props;


    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div>
                            <h1>Game over</h1>
                            {players.map(player => (
                                <div>
                                    <span>{player.login}:{player.score}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={onGoHome}>Go home</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default GameOverModal;