import './HomePage.css';
import { useNavigate } from 'react-router-dom';

function HomePage(props) {
    const { onLogout } = props;
    const navigate = useNavigate();


    function handleCreateGame() {
        navigate('/game/create', { replace: false });
    }

    function handleFindGame() {
        navigate('/game/find', { replace: false });
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
                    <button >Friends</button>
                    <button >My statistics</button> */}
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </div >
    )
}

export default HomePage;
