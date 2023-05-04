import './ActiveLetters.css';

import Tile from "../Tile/Tile";

function ActiveLetters(props) {
    const { letters, onClick } = props;
    return (
        <div>
            <div className="active-letters" onClick={onClick}>
                {letters.map(letter => (
                    <Tile
                        // frontColor={'#FFFFFF'}
                        // backColor={'#000000'}
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