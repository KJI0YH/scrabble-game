import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    function handleLoginChange(event) {
        setLogin(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', { login: login, password: password });
            localStorage.setItem('token', response.data.token);
            navigate('/home', { replace: false });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Login:
                    <input type="text" value={login} onChange={handleLoginChange} />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={handlePasswordChange} />
                </label>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;