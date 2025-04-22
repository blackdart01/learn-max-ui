import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

function PrivateRoute({ children }) {
    const { authToken, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        console.log("loadinggggg");
        return <div>Loading...</div>;
    }

    if (!authToken) {
        console.log("inside privateRoute");
        
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default PrivateRoute;