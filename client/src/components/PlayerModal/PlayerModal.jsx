import './PlayerModal.css'
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import { response } from 'express';

const STAT_URL = `${config.SERVER_URL}/api/user/`;

function PlayerModal(props) {
    const { visible, onCancel, id } = props;
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        axios.get(`${STAT_URL}${id}`)
            .then(response => setStatistics(response))
            .catch(error => console.error(error));
    }, []);

    return (
        <>
            {visible && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            Are you sure you want to leave the game?
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