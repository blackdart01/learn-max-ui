import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authorization';
import { useAuth } from '../contexts/AuthContext';
import PasswordInputWithToggle from './PasswordInputWithToggle';

function LoginForm({ onClose }) {
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

        const credentials = { username, password };

        try {
            const data = await authApi.loginUser(credentials);
            console.log('Login successful:', data);
            localStorage.setItem('authToken', data.token);
            login(data.token, data.user);
            setLoading(false);
            navigate('/dashboard');
            onClose(); 
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
            </div>}
            <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                    Username
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                <button type="button" onClick={onClose} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default LoginForm;