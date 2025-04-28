import axios from 'axios';
import { Question, Test, Attempt, User, TestFormData } from '../types';

// Make sure to use the full URL from the environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API_URL:', API_URL); // Debugging line to check the value

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: (userData: { email: string; password: string; name: string; role: string }) =>
    api.post<User>('/auth/register', userData),
  login: (credentials: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

// Question services
export const questionService = {
  getAllQuestions: () => api.get<Question[]>('/teachers/questions'),
  getQuestionById: (id: string) => api.get<Question>(`/teachers/questions/${id}`),
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'createdBy'>) =>
    api.post<Question>('/teachers/questions', question),
  updateQuestion: (id: string, question: Partial<Question>) =>
    api.put<Question>(`/teachers/questions/${id}`, question),
  deleteQuestion: (id: string) => api.delete(`/teachers/questions/${id}`),
  getAllQuestionsImported: () => api.get<Question[]>('/teachers/questionsImported'),
  getStatusQuestionsImported: () => api.get<{ status: string }>('/teachers/questionsImportedNew'),
  uploadQuestionsExcel: (formData: FormData) =>
    api.post('/teachers/questions/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  toggleActiveStatus: (id: string, value: boolean) =>
    api.put(`/teachers/questions/${id}/${value}`),
  uploadQuestionsScan: (formData: FormData) =>
    api.post('/teachers/questions/upload-csv-v2', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getOpenAiPdf: (formData: FormData) =>
    api.post('/teachers/getOpenAi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Test services
export const testService = {
  getAllTests: () => api.get<Test[]>('/test/tests'),
  getAllTestsNew: () => api.get<Test[]>('/test/tests/new'),
  getTestGist: () => api.get<Test[]>('/test/tests/testGist'),
  createTest: (test: TestFormData) =>
    api.post<Test>('/test/tests', test),
  getTestById: (id: string) => api.get<Test>(`/test/tests/${id}`),
  getTestComplete: (id: string) => api.get<Test>(`/test/tests/${id}/complete`),
  updateTest: (id: string, test: Partial<Test>) => api.put<Test>(`/test/tests/${id}`, test),
  deleteTest: (id: string) => api.delete(`/test/tests/${id}`),
  addQuestionToTest: (testId: string, questionId: string) =>
    api.post(`/test/tests/${testId}/add-question`, { questionId }),
  removeQuestionFromTest: (testId: string, questionId: string) =>
    api.post(`/test/tests/${testId}/remove-question`, { questionId }),
  addQuestionToMultipleTests: (questionId: string, testIds: string[]) =>
    api.post(`/test/tests/${questionId}/add-question-to-multiple-test`, { testIds }),
};

// Student services
export const studentService = {
  getAllAvailableTests: () => api.get<Test[]>('/students/tests'),
  getTestById: (testId: string) => api.get<Test>(`/students/tests/${testId}`),
  startTest: (testId: string) => api.post<Attempt>(`/students/tests/${testId}/start`),
  submitTest: (testId: string, answers: { questionId: string; selectedOption: number }[]) =>
    api.post<Attempt>(`/students/tests/${testId}/submit`, { answers }),
  getStudentAttempts: () => api.get<Attempt[]>('/students/attempts'),
  getStudentAttemptById: (attemptId: string) => api.get<Attempt>(`/students/attempts/${attemptId}`),
  joinTestByCode: (code: string) => api.post('/students/join-test-by-code', { code }),
};

// Teacher services
export const teacherService = {
  getAttemptsByTest: (testId: string) => api.get<Attempt[]>(`/teachers/attempts/${testId}`),
  getAttemptDetails: (attemptId: string) => api.get<Attempt>(`/teachers/attempts/${attemptId}`),
};

export default api; 