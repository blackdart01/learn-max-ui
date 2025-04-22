import axios from 'axios';

// const API_BASE_URL = `${import.meta.env.MAIN_URL || ''}/api/auth`;
// const API_BASE_URL = "http://localhost:5000/api/auth";
const API_BASE_URL = "https://learn-max.onrender.com/api/auth";

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});
const setupAuthInterceptor = (logout) => {
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.log("Unauthorized response. Logging out.");
                logout(); // Call the logout function from the context
            }
            return Promise.reject(error);
        }
    );
};
const authorization = {
    registerUser: async (userData) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL }/register`, userData);
            return data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    loginUser: async (credentials) => {
        console.log("creds->", credentials);
        console.log("uri->", `${API_BASE_URL}`);
        
        try {
            const { data } = await axios.post(`${API_BASE_URL }/login`, credentials);
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    logoutUser: async () => {
        try {
            const { data } = await axiosInstance.post('/logout', {}, {
                headers: getAuthHeader(),
            });
            return data;
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const { data } = await axiosInstance.post('/forgot-password', { email });
            return data;
        } catch (error) {
            console.error('Error requesting password reset:', error);
            throw error;
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const { data } = await axiosInstance.post(`/reset-password/${token}`, { newPassword });
            return data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    },

    getUserProfile: async () => {
        try {
            const { data } = await axiosInstance.get('/profile', {
                headers: getAuthHeader(),
            });
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    updateUserProfile: async (userData) => {
        try {
            const { data } = await axiosInstance.put('/profile', userData, {
                headers: getAuthHeader(),
            });
            return data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    setupAuthInterceptor,
};

export default authorization;
