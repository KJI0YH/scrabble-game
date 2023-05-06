import './ActiveLetters.css';

import Tile from "../Tile/Tile";

function ActiveLetters(props) {
    const { letters, onClick } = props;
    return (
        <div className='active-letters-container'>
            <div className="active-letters" onClick={onClick}>
                {letters.map(letter => (
                    <Tile
                        key={letters.indexOf(letter)}
                        letter={letter.letter}
                        value={letter.value}
                    />
                ))}
            </div>
        </div>
    )

}

export default ActiveLetters;