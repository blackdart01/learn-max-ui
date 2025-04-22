import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/teachers";
// const API_BASE_URL = '/api/teachers'; // Adjust if your API base URL is different

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Assuming token in localStorage
    },
});

const questionApi = {
    // Fetch all questions
    getAllQuestions: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/questions`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error; // Re-throw to be handled in the component
        }
    },

    // Upload questions via CSV/Excel
    uploadQuestions: async (file) => {
        const formData = new FormData();
        formData.append('questions', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/questions/upload-csv`, formData, {
                ...getAuthHeader(),
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading questions:', error);
            throw error;
        }
    },

    // Fetch a single question by ID
    getQuestionById: async (questionId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/questions/${questionId}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error(`Error fetching question with ID ${questionId}:`, error);
            throw error;
        }
    },

    // Create a new question
    createQuestion: async (questionData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/questions`, questionData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    },

    // Update an existing question by ID
    updateQuestion: async (questionId, questionData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/questions/${questionId}`, questionData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error(`Error updating question with ID ${questionId}:`, error);
            throw error;
        }
    },

    // Delete a question by ID
    deleteQuestion: async (questionId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/questions/${questionId}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error(`Error deleting question with ID ${questionId}:`, error);
            throw error;
        }
    },

    // Fetch questions with optional filters (e.g., by subject, isActive)
    getFilteredQuestions: async (filters) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await axios.get(`${API_BASE_URL}/questions?${params.toString()}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error fetching filtered questions:', error);
            throw error;
        }
    },

    // Add more API methods as needed (e.g., for specific question types, etc.)
};

export default questionApi;