import './Board.css';
import Tile from '../Tile/Tile.jsx';

function Board(props) {
    const { rowCount, colCount, premium } = props;
    const bonuses = {
        "triple word": {
            color: '#EA3820',
            caption: "3W"
        },
        "triple letter": {
            color: '#0A8FDF',
            caption: "3L"
        },
        "double word": {
            color: '#E5B5B3',
            caption: "2W",
        },
        "double letter": {
            color: '#AFCBEF',
            caption: "2L",
        },
        "default": {
            color: '#FFFFFF',
            caption: ''
        }
    }

    const grid = [];
    console.log(rowCount);
    console.log(colCount);
    for (let row = 0; row < rowCount; row++) {
        const cols = [];
        for (let col = 0; col < colCount; col++) {
            const bonus = premium && premium.find(p => p.row === row && p.col === col);
            const color = bonus ? bonuses[bonus.type].color : bonuses["default"].color;
            const caption = bonus ? bonuses[bonus.type].caption : bonuses["default"].caption;
            cols.push(
                <Tile
                    key={`${row}-${col}`}
                    color={color}
                    letter={caption}
                />
            )
        }
        grid.push(
            <div className='row' key={row}>
                {cols}
            </div>
        );

    }

    return (
        <div className='board'>
            {console.log(grid)}
            <div className="grid">{grid}</div>
        </div>
    )
}

export default Board;