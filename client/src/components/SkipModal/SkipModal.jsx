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
                        <button onClick={onClick}>Skip</button>
                        <button onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default SkipModal;