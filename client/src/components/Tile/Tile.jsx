import './Tile.css';

function Tile(props) {
    const { letter, value } = props;
    return (
        <div className="tile">
            <div className='letter'>
                {letter}
                <div className='value'>
                    {value}
                </div>
            </div>
        </div>
    )
}

export default Tile;