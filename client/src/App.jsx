import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={< LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
