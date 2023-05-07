import './TileBag.css';
function TileBag(props) {
    const { tiles } = props;

    return (
        <div className='tile-bag-container'>
            <div className='tile-bag-header'>
                <div>
                    Tile bag
                </div>
                <div>
                    Left: {tiles.reduce((sum, tile) => {
                        return sum + tile.count;
                    }, 0)}
                </div>
            </div>
            <div className='tiles'>
                {tiles.map(tile => (
                    <div className='tile-bag-cell'>
                        <div className='tile-bag-cell-letter'>{tile.letter}</div>
                        <div className='tile-bag-cell-count'>&times;{tile.count}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TileBag;