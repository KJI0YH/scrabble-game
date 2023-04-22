import './Tile.css';

function Tile(props) {
    const { letter, value } = props;
    const color = props.color ?? 'white';
    return (
        <div data-letter={letter} data-value={value} className="tile" style={{ backgroundColor: color }}>
            <div className='letter'>
                {letter}
            </div>
            <div className='value'>
                {value}
            </div>
        </div>
    )
}

export default Tile;