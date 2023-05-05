import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import './RegistrationPage.css'
import Swal from 'sweetalert2'

const SERVER_URL = `${config.SERVER_URL}:${config.API_PORT}`;

function RegistrationPage() {
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

    const handleSubmit = async () => {
        try {
            if (password === confirmPassword) {
                const response = await axios.post(`${SERVER_URL}/api/auth/register`, { login: login, password: password });
                Swal.fire({
                    title: 'Success',
                    text: `You have successfully registered as "${login}"`,
                    icon: 'success',
                });
                navigate('/login', { replace: false });
            }
            else {
                Swal.fire({
                    title: 'Oops...',
                    text: 'The passwords do not match. Check and try again.',
                    icon: 'warning',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Oops...',
                text: error.response.data.message,
                icon: 'warning',
            });
        }
    }

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className='registration-container'>
            <div className='registration-form'>
                <div className='registration-header'>Registration</div>
                <div className='registration-content'>
                    <input
                        type="text"
                        placeholder='Login'
                        value={login}
                        onChange={handleLoginChange}
                    />
                    <input
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <input
                        type="password"
                        placeholder='Confirm password'
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                    />

                    <div className='registration-buttons-container'>
                        <button onClick={handleBack}>Back</button>
                        <button onClick={handleSubmit}>Register</button>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default RegistrationPage;
