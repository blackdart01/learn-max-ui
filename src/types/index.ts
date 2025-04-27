export interface User {
  _id: string;
  username: string;
  role: 'student' | 'teacher';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  teacherId: string;
  questionText: string;
  options: string[];
  correctAnswer: string[] | string;
  topic?: string;
  difficulty?: string;
  questionType?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface QuestionModel extends Omit<Question, 'teacherId'> {
  questionType: string;
  timeLimit: number;
  imageLink?: string;
  answerExplanation?: string;
  subject?: string;
  isActive: boolean;
  createdBy: string;
}

export interface Test {
  _id: string;
  teacherId: string;
  title: string;
  description?: string;
  questions: Question[];
  duration: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  selectedOption: string;
}

export interface Attempt {
  _id: string;
  studentId: string;
  testId: string;
  answers: Answer[];
  score?: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface QuestionState {
  questions: Question[];
  currentQuestion: Question | null;
  loading: boolean;
  error: string | null;
}

export interface TestState {
  tests: Test[];
  currentTest: Test | null;
  loading: boolean;
  error: string | null;
}

export interface AttemptState {
  attempts: Attempt[];
  currentAttempt: Attempt | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface QuestionFormData {
  questionText: string;
  options: string[];
  correctAnswer: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TestFormData {
  title: string;
  description?: string;
  duration: number;
  startDate?: string;
  endDate?: string;
  questions: string[];
} 