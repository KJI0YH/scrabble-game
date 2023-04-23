import './Tile.css';

function Tile(props) {
    const { letter, value } = props;
    return (
        <div data-letter={letter} data-value={value} className="tile" style={props.color && { backgroundColor: props.color }}>
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