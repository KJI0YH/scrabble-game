import ActiveLetters from '../ActiveLetters/ActiveLetters';
import Tile from '../Tile/Tile';
import './History.css';

function History(props) {
    const { history } = props;
    const typeColors = {
        "submit": "#6aa061",
        "leave": "#f44336",
        "challenge": "#e79029",
        "skip": "#af7d88",
        "swap": "#af7d88",
    }

    return (
        <div className='history-container'>
            <div className='history-header'>
                History
            </div>
            <div className='history-content-container'>
                {history.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(h => (
                    <div className='history-content'>
                        <div className='history-content-header'>
                            <div className='history-type' style={{ backgroundColor: typeColors[h.type] }}>
                                {h.player ? `${h.player} : ` : ''}{h.type}
                            </div>
                            <div className='history-login'>
                            </div>
                            {h.score && (
                                <div className='history-score' style={{ backgroundColor: typeColors[h.type] }} >
                                    Score: {h.score}
                                </div>
                            )}
                        </div>

                        {
                            h.letters && h.type === "submit" && (
                                <div className='history-letters'>
                                    {h.letters.map(l => (
                                        <Tile
                                            letter={l.cell.letter}
                                            value={l.cell.value}
                                        />
                                    ))}
                                </div >
                            )
                        }

                        {
                            h.letters && h.type === "swap" && (
                                <div className='history-letters'>
                                    {h.letters.map(l => (
                                        <Tile
                                            letter={l.letter}
                                            value={l.value}
                                        />
                                    ))}
                                </div >
                            )
                        }



                        < div className='history-timestamp' >
                            {new Date(h.timestamp).toLocaleString()}
                        </div>
                    </div>
                ))
                }
            </div >

        </div >
    )
}

export default History;