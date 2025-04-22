import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authorization'
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (token, userData) => {
        setAuthToken(token);        
        setUser(userData)
        localStorage.setItem('authToken', token); 
        localStorage.setItem('userData', JSON.stringify(userData)); 
    };

    const logout = async () => {
        setAuthToken(null);
        setUser(null);
        const data = await authApi.logoutUser();
        console.log('Logged out successfully:', data);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };
    const checkTokenExpiration = () => {
        console.log("inside checkTokenExpiration");
        
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log("expiry time -> ", decodedToken.exp);
                const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
                console.log("currentTime -> ", currentTime);
                if (decodedToken.exp < currentTime) {
                    console.log('Token expired. Logging out.');
                    logout();
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                logout(); // Logout if token is invalid
            }
        }
    };
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const user = JSON.parse(localStorage.getItem('userData'));
            if (token) {
                setAuthToken(token);
                checkTokenExpiration();
                setUser(user)
                console.log("authToken loaded from localStorage:", token);
                console.log("user loaded from localStorage:", user);
                // try {
                //     const userData = await authApi.getUserProfile();
                //     setUser(userData);
                // } catch (error) {
                //     console.error("Error fetching user data on load:", error);
                //     logout(); 
                // }
            }
            setLoading(false);
        };
        loadUser();
        const intervalId = setInterval(checkTokenExpiration, 60000); 
        return () => clearInterval(intervalId);
    }, []);

    const contextValue = {
        authToken,
        user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthContext };