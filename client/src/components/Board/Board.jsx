import './Board.css';
import Tile from '../Tile/Tile.jsx';

function Board(props) {
    const { rowCount, colCount } = props;

    const grid = [];
    for (let row = 0; row < rowCount; row++) {
        const cols = [];
        for (let col = 0; col < colCount; col++) {
            cols.push(<Tile key={`${row}-${col}`} />)
        }
        grid.push(
            <div className='row' key={row}>
                <div style={{ width: "25px" }}>{row + 1}</div>
                {cols}
            </div>
        );
    }

    return (
        <div className="grid">{grid}</div>
    )
}

export default Board;