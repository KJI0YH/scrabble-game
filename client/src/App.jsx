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
import { config } from './config.js';

const SERVER_URL = `${config.SERVER_URL}:${config.API_PORT}`;

function App() {
    const [isLogged, setIsLogged] = useState(false);

    const onLogin = async () => {
        await verifyToken();
        setIsLogged(true)
    }

    const verifyToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.post(`${SERVER_URL}/api/auth/verify`, { token: token });
                if (response.status === 200) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userID', response.data.decoded.userID);
                    localStorage.setItem('login', response.data.decoded.login);
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
                <Route path='/login' element={isLogged ? <Navigate to='/' /> : <LoginPage onLogin={onLogin} />} />
                <Route path='/registration' element={<RegistrationPage />} />
                <Route path='/' element={isLogged ? <HomePage onLogout={() => setIsLogged(false)} /> : <Navigate to='/login' />} />
                <Route path='/game/create' element={<CreateGamePage />} />
                <Route path='/game/find' element={<FindGamePage />} />
                <Route path='/game/wait' element={<WaitGamePage />} />
                <Route path='/game/play' element={<PlayGamePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
