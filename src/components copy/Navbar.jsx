import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const { authToken, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/home')
        // Optionally redirect to the homepage or login page
    };

    return (
        <nav className="bg-blue-500 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="text-white text-xl font-bold">
                    Quiz App
                </Link>
                <div>
                    {authToken ? (
                        <div className="flex relative">
                            <div
                                className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                title="Profile"
                            >
                                <span className="text-blue-500 font-semibold uppercase text-sm">
                                    {console.log(user)}
                                    {user?.username?.charAt(0) || user}
                                </span>
                            </div>
                            {/* Optional: Profile dropdown on hover (requires more state management) */}
                            {/* <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10 hidden hover:block">
                                <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    Profile
                                </Link>
                                <button onClick={handleLogout} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">
                                    Logout
                                </button>
                            </div> */}
                            <button onClick={handleLogout} className="ml-4 text-white hover:text-blue-200">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/register" className="text-white hover:text-blue-200 mr-4">
                                Register
                            </Link>
                            <Link to="/login" className="text-white hover:text-blue-200">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;