import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-red-500 mb-6">404</h1>
            <p className="text-2xl text-gray-700 mb-4">Oops! Page not found.</p>
            <p className="text-gray-600 mb-6">The requested URL could not be found on this server.</p>
            <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline">
                Go back to Home
            </Link>
        </div>
    );
}

export default NotFound;