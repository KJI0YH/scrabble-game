import './GameOverModal.css';

function GameOverModal(props) {
    const { visible, players, onGoHome } = props;


    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            Game over
                        </div>
                        {players.sort((a, b) => b.score - a.score).map(player => (
                            <div>
                                {`${player.login} : ${player.score}`}
                            </div>
                        ))}
                        <div className='modal-buttons'>
                            <button onClick={onGoHome} style={{ backgroundColor: '#6aa061' }}>Go home</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default GameOverModal;