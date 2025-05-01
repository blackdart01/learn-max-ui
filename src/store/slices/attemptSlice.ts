import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AttemptState, Attempt } from '../../types';
import { studentService, teacherService } from '../../services/api';

const initialState: AttemptState = {
  attempts: [],
  currentAttempt: null,
  loading: false,
  error: null,
};

export const fetchStudentAttempts = createAsyncThunk(
  'attempts/fetchStudentAttempts',
  async () => {
    const response = await studentService.getStudentAttempts();
    return response.data;
  }
);

export const fetchAttemptsByTest = createAsyncThunk(
  'attempts/fetchByTest',
  async (testId: string) => {
    const response = await teacherService.getAttemptsByTest(testId);
    return response.data;
  }
);
export const getAllAttempts = createAsyncThunk(
  'teachers/attempts',
  async () => {
    const response = await teacherService.getAllAttempts();
    return response;
  }
);
export const getAllAttemptsByAttemptId = createAsyncThunk(
  '/teachers/attempts/attempt',
  async (attemptId: string) => {
    const response = await teacherService.getAllAttemptsByAttemptId(attemptId);
    return response;
  }
);

export const startTest = createAsyncThunk(
  'attempts/start',
  async (testId: string) => {
    const response = await studentService.startTest(testId);
    return response.data;
  }
);

export const submitTest = createAsyncThunk(
  'attempts/submit',
  async ({ testId, answers }: { testId: string; answers: { questionId: string; selectedOption: number }[] }) => {
    const response = await studentService.submitTest(testId, answers);
    return response.data;
  }
);

const attemptSlice = createSlice({
  name: 'attempts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAttempt: (state, action) => {
      state.currentAttempt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch student attempts
      .addCase(fetchStudentAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload;
      })
      .addCase(fetchStudentAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch attempts';
      })
      // Fetch attempts by test
      .addCase(fetchAttemptsByTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttemptsByTest.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload;
      })
      .addCase(fetchAttemptsByTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch attempts';
      })
      // Start test
      .addCase(startTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
      })
      .addCase(startTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start test';
      })
      // Submit test
      .addCase(submitTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
        const index = state.attempts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.attempts[index] = action.payload;
        } else {
          state.attempts.push(action.payload);
        }
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit test';
      });
  },
});

export const { clearError, setCurrentAttempt } = attemptSlice.actions;
export default attemptSlice.reducer; 