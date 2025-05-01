import axios from 'axios';
import { ApiResponse, User, Question, Test, Attempt } from '../../types';

const API_URL = import.meta.env.VITE_API_URL.slice(0, -4) || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      error.response.data &&
      (error.response.data.message?.toLowerCase().includes('token') || error.response.data.message?.toLowerCase().includes('unauthorized'))
    ) {
      // Remove token and user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch a custom event for toast and redirect
      window.dispatchEvent(new CustomEvent('tokenExpired'));
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    console.log("insideeeeeeeeeeeeeeee");
    
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (username: string, password: string, role: 'student' | 'teacher'): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
};

// Question Service
export const questionService = {
  getAllQuestions: async (): Promise<ApiResponse<Question[]>> => {
    const response = await api.get('/teachers/questions');
    return response.data;
  },

  getQuestionById: async (id: string): Promise<ApiResponse<Question>> => {
    const response = await api.get(`/teachers/questions/${id}`);
    return response.data;
  },

  createQuestion: async (question: Omit<Question, '_id' | 'teacherId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Question>> => {
    const response = await api.post('/teachers/questions', question);
    return response.data;
  },

  updateQuestion: async (id: string, question: Partial<Question>): Promise<ApiResponse<Question>> => {
    const response = await api.put(`/teachers/questions/${id}`, question);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/teachers/questions/${id}`);
    return response.data;
  },
};

// Test Service
export const testService = {
  // Teacher endpoints
  getAllTests: async (): Promise<ApiResponse<Test[]>> => {
    const response = await api.get('/teachers/tests');
    return response.data;
  },

  getTestById: async (id: string): Promise<ApiResponse<Test>> => {
    const response = await api.get(`/teachers/tests/${id}`);
    return response.data;
  },

  createTest: async (test: Omit<Test, '_id' | 'teacherId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Test>> => {
    const response = await api.post('/teachers/tests', test);
    return response.data;
  },

  updateTest: async (id: string, test: Partial<Test>): Promise<ApiResponse<Test>> => {
    const response = await api.put(`/teachers/tests/${id}`, test);
    return response.data;
  },

  deleteTest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/teachers/tests/${id}`);
    return response.data;
  },

  addQuestionToTest: async (testId: string, questionId: string): Promise<ApiResponse<Test>> => {
    const response = await api.post(`/teachers/tests/${testId}/add-question`, { questionId });
    return response.data;
  },

  removeQuestionFromTest: async (testId: string, questionId: string): Promise<ApiResponse<Test>> => {
    const response = await api.post(`/teachers/tests/${testId}/remove-question`, { questionId });
    return response.data;
  },

  getTestAttempts: async (testId: string): Promise<ApiResponse<Attempt[]>> => {
    const response = await api.get(`/teachers/attempts/${testId}`);
    return response.data;
  },

  getAttemptDetails: async (attemptId: string): Promise<ApiResponse<Attempt>> => {
    const response = await api.get(`/teachers/attempts/${attemptId}`);
    return response.data;
  }
};

// Student Service
export const studentService = {
  getAvailableTests: async (): Promise<ApiResponse<Test[]>> => {
    const response = await api.get('/students/tests');
    return response.data;
  },

  getTestById: async (testId: string): Promise<ApiResponse<Test>> => {
    const response = await api.get(`/students/tests/${testId}`);
    return response.data;
  },

  startTest: async (testId: string): Promise<ApiResponse<Attempt>> => {
    const response = await api.post(`/students/tests/${testId}/start`);
    return response.data;
  },

  submitTest: async (testId: string, answers: Record<string, string>): Promise<ApiResponse<Attempt>> => {
    const response = await api.post(`/students/tests/${testId}/submit`, { answers });
    return response.data;
  },

  getAttempts: async (): Promise<ApiResponse<Attempt[]>> => {
    const response = await api.get('/students/attempts');
    return response.data;
  },

  getAttemptById: async (attemptId: string): Promise<ApiResponse<Attempt>> => {
    const response = await api.get(`/students/attempts/${attemptId}`);
    return response.data;
  }
};

export default api; 