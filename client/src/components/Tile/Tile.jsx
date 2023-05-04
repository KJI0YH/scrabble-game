import './Tile.css';

function Tile(props) {
    const { letter, value, backColor, frontColor } = props;
    return (
        <div
            data-letter={letter}
            data-value={value}
            className="tile"
            style={{ backgroundColor: backColor, color: frontColor }}
        >
            <div className='letter'>
                {letter}
            </div>
            <div className='value'>
                {value}
            </div>
        </div >
    )
}

export default Tile;