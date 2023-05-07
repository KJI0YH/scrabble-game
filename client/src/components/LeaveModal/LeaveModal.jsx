import './LeaveModal.css'

function LeaveModal(props) {
    const { visible, onClick, onCancel } = props;

    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            Are you sure you want to leave the game?
                        </div>
                        <div className='modal-buttons'>
                            <button onClick={onCancel} style={{ backgroundColor: '#6aa061' }}>Stay</button>
                            <button onClick={onClick} style={{ backgroundColor: '#f44336' }}>Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default LeaveModal;