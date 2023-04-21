import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import CreateGamePage from './pages/CreateGamePage/CreateGamePage.jsx';
import FindGamePage from './pages/FindGamePage/FindGamePage.jsx';
import WaitGamePage from './pages/WaitGamePage/WaitGamePage.jsx';
import PlayGamePage from './pages/PlayGamePage/PlayGamePage.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={< LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route path='/' element={<HomePage />} />
                <Route path='/game/create' element={<CreateGamePage />} />
                <Route path='/game/find' element={<FindGamePage />} />
                <Route path='/game/wait' element={<WaitGamePage />} />
                <Route path='/game/play' element={<PlayGamePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
