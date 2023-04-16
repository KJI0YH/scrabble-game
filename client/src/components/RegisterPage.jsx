import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConnfirmPassword] = useState('');
    const navigate = useNavigate();

    function handleLoginChange(event) {
        setLogin(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    function handleConfirmPasswordChange(event) {
        setConnfirmPassword(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            if (password === confirmPassword) {
                console.log(login, password);
                await axios.post('http://localhost:8080/api/auth/register', { login: login, password: password });
                navigate('/login', { replace: false });
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Login:
                    <input type="text" value={login} onChange={handleLoginChange} />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={handlePasswordChange} />
                </label>
                <label>
                    Confirm password:
                    <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;
