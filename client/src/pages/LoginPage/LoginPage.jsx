import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import './LoginPage.css';
import Swal from 'sweetalert2'

const SERVER_URL = `${config.SERVER_URL}:${config.API_PORT}`;

function LoginPage(props) {
    const { onLogin } = props;
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
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
            const response = await axios.post(`${SERVER_URL}/api/auth/login`, { login: login, password: password });
            localStorage.setItem('token', response.data.token);
            await onLogin();
            navigate('/', { replace: true });
        } catch (error) {
            Swal.fire({
                title: "Login error",
                text: error.response.data.message,
                icon: 'error',
                background: '#f44336',
                color: 'white',
                iconColor: 'white'
            })
        }
    }

    const handleRegistration = () => {
        navigate('/registration', { replace: false });
    }

    return (
        <div className='login-container'>
            <div className='login-form'>
                <div className='login-header'>Login</div>
                <form onSubmit={handleSubmit} className='login-content'>
                    <input
                        type="text"
                        placeholder='Login'
                        value={login}
                        onChange={handleLoginChange} />

                    <input
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={handlePasswordChange} />

                    <div className='login-buttons-container'>
                        <button type="submit">Login</button>
                        <button onClick={handleRegistration}>Sign up </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;