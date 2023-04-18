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
        <div className='buttons'>
            <button onClick={handleCreateGame}>Create a game</button>
            <button onClick={handleFindGame}>Find a game</button>
        </div>
    )
}

export default HomePage;
