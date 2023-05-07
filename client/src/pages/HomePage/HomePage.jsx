import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from 'react';
import PlayerModal from '../../components/PlayerModal/PlayerModal';
import { config } from '../../config';
const STAT_URL = `${config.SERVER_URL}:${config.API_PORT}/api/user/`;

function HomePage(props) {
    const { onLogout } = props;
    const navigate = useNavigate();
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [statistics, setStatistics] = useState(null);


    function handleCreateGame() {
        navigate('/game/create', { replace: false });
    }

    function handleFindGame() {
        navigate('/game/find', { replace: false });
    }

    const handleGetStatistics = async () => {
        const userID = localStorage.getItem('userID');
        if (userID) {
            try {
                const response = await axios.get(`${STAT_URL}${userID}`);
                setShowPlayerModal(true)
                setStatistics(response.data.user);
            } catch (error) {
                console.log(error);
            }
        } else {
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
    }

    return (
        <div className='home-container'>
            <div className='home-content'>
                <div className='home-header'>Menu</div>
                <div className='home-buttons'>
                    <button onClick={handleCreateGame}>Create a new party</button>
                    <button onClick={handleFindGame}>Find an online party </button>
                    {/* <button >Users</button>
                    <button >Friends</button> */}
                    <button onClick={handleGetStatistics}>My statistics</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <PlayerModal
                visible={showPlayerModal}
                onCancel={() => setShowPlayerModal(false)}
                statistics={statistics}
            />
        </div >
    )
}

export default HomePage;
