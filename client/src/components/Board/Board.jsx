import './Board.css';
import Tile from '../Tile/Tile.jsx';
import { useEffect, useRef, useState } from 'react';
import arrow from './right-arrow.png';

function Board(props) {
    const { rowCount, colCount, premium, onCellClick, input } = props;
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
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    useEffect(() => {
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', onCellClick);
        });

        return () => {
            cells.forEach(cell => {
                cell.removeEventListener('click', onCellClick);
            });
        }
    }, []);

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
                const bonus = premium && premium.find(p => p.row === row && p.col === col);
                const color = bonus ? bonuses[bonus.type].color : bonuses["default"].color;
                const caption = bonus ? bonuses[bonus.type].caption : bonuses["default"].caption;

                let cell = (
                    <Tile
                        color={color}
                        letter={caption}
                    />
                );
                if (input.row >= 0 && input.row < rowCount &&
                    input.col >= 0 && input.col < colCount &&
                    input.row == row && input.col == col) {
                    cell = (
                        <div className='arrow-container' style={{ backgroundColor: color }}>
                            <img
                                src={arrow}
                                alt="arrow"
                                style={{
                                    transform: input.horizontal ? 'none' : 'rotate(90deg)',
                                }} />
                        </div>
                    )
                }
                cells.push(
                    <div data-row={row} data-col={col} className='board-cell'>
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