import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import authApi from '../api/authorization'; 
import PasswordInputWithToggle from '../components/PasswordInputWithToggle';
import {useAuth} from '../contexts/AuthContext';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = {
            username: username,
            password: password,
        };

        try {
            const data = await authApi.loginUser(credentials);
            console.log('Login successful:', data);
            localStorage.setItem('authToken', data.token);
            login(data.token, data.user); 
            setLoading(false);
            navigate('/dashboard');
        } catch (err) {localStorage.
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed');
        }
    };
    return (
        <div className="flex justify-center items-center bg-white w-full h-full">
            <div className="bg-gray-100 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
                <h2 className="block text-gray-700 text-xl font-bold mb-4">Login</h2>
                {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="text"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <PasswordInputWithToggle
                            id="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-gray-600 text-xs italic">Minimum 6 characters</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Logging In...' : 'Sign In'}
                        </button>
                        <Link to="/register" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;