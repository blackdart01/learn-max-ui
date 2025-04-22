import React from 'react';
import LoginForm from './LoginForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function LoginModal({ isOpen, onClose }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-xl p-8 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
                <h2 className="block text-gray-700 text-xl font-bold mb-4">Login</h2>
                <LoginForm onClose={onClose} />
            </div>
        </div>
    );
}

export default LoginModal;