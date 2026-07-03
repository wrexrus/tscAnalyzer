import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './utils';
import { Home } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { API_BASE_URL } from '../api';
const Login = () => {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('Field must not be empty');
        }
        try {
            const url = `${API_BASE_URL}/auth/login`
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                window.dispatchEvent(new Event('authChanged'));
                setTimeout(() => {
                    navigate('/');
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const url = `${API_BASE_URL}/auth/google`
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                window.dispatchEvent(new Event('authChanged'));
                setTimeout(() => {
                    navigate('/');
                }, 1000)
            } else {
                handleError(message || error);
            }
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <>
            <div className="container">
                <div className="login-container">
                    <h1>Login</h1>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                onChange={handleChange}
                                type="email"
                                name="email"
                                placeholder="Enter your Email..."
                                value={loginInfo.email}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                onChange={handleChange}
                                type="password"
                                name="password"
                                placeholder="Enter your Password..."
                                value={loginInfo.password}
                            />
                        </div>

                        <button className="btn">Login</button>
                        
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    handleError('Google Login Failed');
                                }}
                            />
                        </div>

                        <p className="redirect-text">
                            Dont have an account? <Link style={{fontSize: "19px"}} to="/signup" id='signup'> SignUp</Link>
                        </p>
                    </form>

                    <span className='home' onClick={() => {
                        navigate('/');
                    }}> Home </span>

                    <ToastContainer />
                </div>
            </div>
        </>
    )
}

export default Login
