import { useState, useEffect } from 'react';
import ActiveLetters from '../ActiveLetters/ActiveLetters';
import './SwapModal.css'

function SwapModal(props) {
    const { visible, letters, onClick, onCancel } = props;
    const [selectedLetters, setSelectedLetters] = useState([]);

    const handleLetterClick = (event) => {
        const cell = event.target.closest('.tile');
        if (cell && cell.classList.contains('swap')) {
            cell.classList.remove('swap');
            cell.classList.remove('selected');
        } else if (cell && !cell.classList.contains('swap')) {
            cell.classList.add('swap');
            cell.classList.add('selected');
        }

        const cells = [];
        const letters = document.querySelectorAll('.swap');
        letters.forEach(selected => {
            const letter = selected.dataset.letter;
            const value = parseInt(selected.dataset.value);
            cells.push({
                letter: letter,
                value: value,
            });
        });
        setSelectedLetters(cells);
    }

    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div>
                            <span>Select letters to swap</span>
                        </div>
                        <ActiveLetters
                            letters={letters}
                            onClick={handleLetterClick}
                        />
                        <div className='modal-buttons'>
                            <button onClick={onCancel} style={{ backgroundColor: '#f44336' }}>Cancel</button>
                            <button onClick={() => onClick(selectedLetters)} style={{ backgroundColor: '#6aa061' }}>Swap</button>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    );
}

export default SwapModal;