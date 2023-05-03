import './Board.css';
import Tile from '../Tile/Tile.jsx';
import Arrow from '../Arrow/Arrow';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function Board(props) {
    const {
        rowCount, colCount,
        premium, oldLetters, newLetters, resolveLetters,
        onClick, onMouseDown,
        input
    } = props;

    let letters = [];
    if (resolveLetters)
        letters = letters.concat(resolveLetters.map(letter => { return { ...letter, type: "resolve letter" } }));
    if (oldLetters)
        letters = oldLetters && letters.concat(oldLetters.map(letter => { return { ...letter, type: "old letter" } }));

    if (newLetters)
        letters = newLetters && letters.concat(newLetters.map(letter => { return { ...letter, type: "new letter" } }));

    const colors = {
        "triple word": '#EA3820',
        "triple letter": '#0A8FDF',
        "double word": '#E5B5B3',
        "double letter": '#AFCBEF',
        "initial": '#E5B5B3',
        "old letter": '#FFFFFF',
        "new letter": '#FFFF00',
        "resolve letter": '#FFFF00',
        "default": '#FFFFFF',
    }

    const captions = {
        "triple word": "3W",
        "triple letter": "3L",
        "double word": "2W",
        "double letter": "2L",
        "initial": '★',
        "default": ''
    }

    const renderBoard = () => {
        const cells = [];

        cells.push(
            <div className='axis'></div>
        )

        for (let x = 0; x < rowCount; x++) {
            cells.push(
                <div className='axis'>{alphabet[x]}</div>
            )
        }

        for (let row = 0; row < rowCount; row++) {
            cells.push(<div className='axis'>{row + 1}</div>)
            for (let col = 0; col < colCount; col++) {
                const cellIndex = row * colCount + col;

                let caption = captions["default"];
                let color = colors["default"];
                let value = '';

                const bonus = premium && premium.find(p => p.row === row && p.col === col);
                const letter = letters && letters.find(l => l.row === row && l.col === col);

                if (letter) {
                    caption = letter.cell.letter;
                    value = letter.cell.value;
                    color = colors[letter.type];
                } else if (bonus) {
                    caption = captions[bonus.type];
                    color = colors[bonus.type];
                }

                let cell = (
                    <Tile
                        color={color}
                        letter={caption}
                        value={value}
                    />
                );

                if (input.row >= 0 && input.row < rowCount &&
                    input.col >= 0 && input.col < colCount &&
                    input.row === row && input.col === col) {
                    cell = (
                        <Arrow
                            color={color}
                            horizontal={input.horizontal}
                        />
                    )
                }
                cells.push(
                    <div
                        key={cellIndex}
                        data-row={row}
                        data-col={col}
                        className='board-cell'
                        onClick={onClick}
                        onMouseDown={onMouseDown}
                    >
                        {cell}
                    </div>

                )
            }
        }
        return cells;
    }


    return (
        <div className='board'>
            {renderBoard()}
        </div>
    )
}

export default Board;