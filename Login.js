import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import '../styles/auth.css';

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', {
                ...credentials,
                password: '[REDACTED]'
            });
            console.log('API URL:', `${config.API_URL}/api/auth/login`);

            const response = await axios.post(`${config.API_URL}/api/auth/login`, credentials);
            console.log('Login response:', {
                status: response.status,
                data: response.data ? {
                    ...response.data,
                    token: response.data.token ? '[PRESENT]' : '[MISSING]'
                } : null
            });

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.user.username);
                navigate('/tasks');
            } else {
                console.error('Invalid response structure:', response.data);
                setError('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                response: error.response ? {
                    status: error.response.status,
                    data: error.response.data
                } : null
            });

            if (error.response && error.response.data) {
                setError(error.response.data.error || 'Login failed');
            } else {
                setError('An error occurred during login. Please check the console for details.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Welcome Back</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email or Username</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                            placeholder="Enter your email or username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="auth-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                Signing In
                                <span className="loading"></span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
