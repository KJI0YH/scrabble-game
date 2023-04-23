import './TileBag.css';
function TileBag(props) {
    const { tiles } = props;

    return (
        <div className='tile-bag'>
            {tiles.map(tile => (
                <div className='tile-bag-cell'>
                    <div className='tile-bag-cell-letter'>{tile.letter}</div>
                    <div className='tile-bag-cell-count'>&times;{tile.count}</div>
                </div>
            ))}
        </div>
    )

}

export default TileBag;