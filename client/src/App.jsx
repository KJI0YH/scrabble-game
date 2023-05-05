import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import CreateGamePage from './pages/CreateGamePage/CreateGamePage.jsx';
import FindGamePage from './pages/FindGamePage/FindGamePage.jsx';
import WaitGamePage from './pages/WaitGamePage/WaitGamePage.jsx';
import PlayGamePage from './pages/PlayGamePage/PlayGamePage.jsx';
import axios from 'axios';

function App() {
    const [isLogged, setIsLogged] = useState(false);

    const verifyToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.post('http://localhost:8080/api/auth/verify', { token: token });
                if (response.status === 200) {
                    localStorage.setItem('token', response.data.token);
                    setIsLogged(true);
                } else {
                    setIsLogged(false);
                }
            } catch (err) {
                console.error(err);
                setIsLogged(false);
            }
        } else {
            setIsLogged(false);
        }
    }

    useEffect(() => {
        verifyToken();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={isLogged ? <Navigate to='/' /> : <LoginPage onLogin={() => setIsLogged(true)} />} />
                <Route path='/registration' element={<RegistrationPage />} />
                <Route path='/' element={isLogged ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/game/create' element={<CreateGamePage />} />
                <Route path='/game/find' element={<FindGamePage />} />
                <Route path='/game/wait' element={<WaitGamePage />} />
                <Route path='/game/play' element={<PlayGamePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
