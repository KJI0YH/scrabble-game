import './SkipModal.css'

function SkipModal(props) {
    const { visible, onClick, onCancel } = props;

    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div>
                            <span>Are you sure you want to skip a move?</span>
                        </div>
                        <div className='modal-buttons'>
                            <button onClick={onCancel} style={{ backgroundColor: '#f44336' }}>Cancel</button>
                            <button onClick={onClick} style={{ backgroundColor: '#6aa061' }}>Skip</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SkipModal;