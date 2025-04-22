import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModel';
import RegisterModal from '../components/RegisterModel';

function Navbar() {
    const { authToken, user, logout } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
    };

    const handleLogout = () => {
        logout();
        // Optionally redirect to the homepage
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
                                    {console.log("user ->", user)}{user?.username?.charAt(0) || '?'}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="ml-4 text-white hover:text-blue-200">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={openRegisterModal} className="text-white hover:text-blue-200 mr-4">
                                Register
                            </button>
                            <button onClick={openLoginModal} className="text-white hover:text-blue-200">
                                Login
                            </button>
                        </>
                    )}
                </div>
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
            <RegisterModal isOpen={isRegisterModalOpen} onClose={closeRegisterModal} />
        </nav>
    );
}

export default Navbar;