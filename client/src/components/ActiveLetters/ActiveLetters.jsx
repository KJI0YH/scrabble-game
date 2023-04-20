import './ActiveLetters.css';

import Tile from "../Tile/Tile";

function ActiveLetters(props) {
    const { letters } = props;
    return (
        <div>
            <div className="active-letters">
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