import './LeaveModal.css'

function LeaveModal(props) {
    const { visible, onClick, onCancel } = props;

    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div>
                            <span>Are you sure you want to leave the game?</span>
                        </div>
                        <button onClick={onClick}>Leave</button>
                        <button onClick={onCancel}>Stay</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default LeaveModal;