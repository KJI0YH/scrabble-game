import './HomePage.css';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();


    function handleCreateGame() {
        navigate('/game/create', { replace: false });
    }

    function handleFindGame() {
        navigate('/game/find', { replace: false });
    }

    return (
        <div className='home-container'>
            <div className='home-content'>
                <div className='home-header'>Menu</div>
                <div className='home-buttons'>
                    <button onClick={handleCreateGame}>Create a new party</button>
                    <button onClick={handleFindGame}>Find an online party </button>
                    <button >Users</button>
                    <button >Friends</button>
                    <button >My statistics</button>
                    <button >Logout</button>
                </div>
            </div>
        </div >
    )
}

export default HomePage;
