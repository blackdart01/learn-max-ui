import axios from 'axios';

const API_BASE_URL = "https://learn-max.onrender.com/api/test";
// const API_BASE_URL = "http://localhost:5000/api/test";
// const API_BASE_URL = '/api/teachers'; // Adjust if your API base URL is different

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Assuming token in localStorage
    },
});

const testApi = {
    // Fetch all questions
    getAllTests: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tests/new`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error; // Re-throw to be handled in the component
        }
    },
    getTestGist: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tests/testGist`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error fetching testGist:', error);
            throw error; // Re-throw to be handled in the component
        }
    },
    addQuestionToTest: async (testId, questionId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/tests/${testId}/add-question`,
                { questionId: questionId }, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error fetching testGist:', error);
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

    // Fetch a single test by ID
    getTestById: async (testId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tests/${testId}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error(`Error fetching test with ID ${testId}:`, error);
            throw error;
        }
    },

    // Create a new test
    createQuestion: async (testData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/tests`, testData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    },

    // Update an existing test by ID
    updateTest: async (testId, testData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/tests/${testId}`, testData, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error(`Error updating test with ID ${testId}:`, error);
            throw error;
        }
    },

    // Delete a test by ID
    deleteTest: async (testId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/tests/${testId}`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error(`Error deleting test with ID ${testId}:`, error);
            throw error;
        }
    },
};

export default testApi;