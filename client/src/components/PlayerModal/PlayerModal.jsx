import './PlayerModal.css'
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { config } from '../../config';

const STAT_URL = `${config.SERVER_URL}:${config.API_PORT}/api/user/`;

function PlayerModal(props) {
    const { visible, onCancel, statistics } = props;

    return (
        <>
            {visible && statistics && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div>
                            {statistics.login}
                        </div>
                        <div className='player-stat-container'>
                            <div className='player-stat'>Games played: {statistics.gamesPlayed}</div>
                            <div className='player-win-draw-lose'>
                                <div className='player-stat' style={{ backgroundColor: '#6aa061' }}>Wins: {statistics.wins}</div>
                                <div className='player-stat' style={{ backgroundColor: '#e79029' }}>Draws: {statistics.draws}</div>
                                <div className='player-stat' style={{ backgroundColor: '#f44336' }}>Loses: {statistics.loses}</div>
                            </div>
                            <div className='player-stat'>Average game score: {Math.round(statistics.averageGameScore)}</div>
                            <div className='player-stat'>Max score: {statistics.maxScore}</div>
                            <div className='player-stat'>Glicko rating: {Math.round(statistics.ratingGlicko)}</div>
                            <div className='player-stat'>Rating deviation: {Math.round(statistics.ratingDeviation)}</div>
                            <div className='player-stat'>Joined: {new Date(statistics.joined).toLocaleString()}</div>
                        </div>
                        <div className='modal-buttons'>
                            <button onClick={onCancel} style={{ backgroundColor: '#6aa061' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default PlayerModal;