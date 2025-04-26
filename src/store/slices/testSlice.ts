import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TestState, Test } from '../../types';
import { testService } from '../../services/api';

const initialState: TestState = {
  tests: [],
  currentTest: null,
  loading: false,
  error: null,
};

export const fetchTests = createAsyncThunk(
  'tests/fetchAll',
  async () => {
    const response = await testService.getAllTests();
    return response.data;
  }
);

export const createTest = createAsyncThunk(
  'tests/create',
  async (test: Omit<Test, 'id' | 'createdAt' | 'createdBy'>) => {
    const response = await testService.createTest(test);
    return response.data;
  }
);

export const updateTest = createAsyncThunk(
  'tests/update',
  async ({ id, test }: { id: string; test: Partial<Test> }) => {
    const response = await testService.updateTest(id, test);
    return response.data;
  }
);

export const deleteTest = createAsyncThunk(
  'tests/delete',
  async (id: string) => {
    await testService.deleteTest(id);
    return id;
  }
);

export const addQuestionToTest = createAsyncThunk(
  'tests/addQuestion',
  async ({ testId, questionId }: { testId: string; questionId: string }) => {
    const response = await testService.addQuestionToTest(testId, questionId);
    return response.data;
  }
);

export const removeQuestionFromTest = createAsyncThunk(
  'tests/removeQuestion',
  async ({ testId, questionId }: { testId: string; questionId: string }) => {
    const response = await testService.removeQuestionFromTest(testId, questionId);
    return response.data;
  }
);

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tests
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tests';
      })
      // Create test
      .addCase(createTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests.push(action.payload);
      })
      .addCase(createTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create test';
      })
      // Update test
      .addCase(updateTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        if (state.currentTest?.id === action.payload.id) {
          state.currentTest = action.payload;
        }
      })
      .addCase(updateTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update test';
      })
      // Delete test
      .addCase(deleteTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = state.tests.filter((t) => t.id !== action.payload);
        if (state.currentTest?.id === action.payload) {
          state.currentTest = null;
        }
      })
      .addCase(deleteTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete test';
      })
      // Add question to test
      .addCase(addQuestionToTest.fulfilled, (state, action) => {
        const test = action.payload;
        const index = state.tests.findIndex((t) => t.id === test.id);
        if (index !== -1) {
          state.tests[index] = test;
        }
        if (state.currentTest?.id === test.id) {
          state.currentTest = test;
        }
      })
      // Remove question from test
      .addCase(removeQuestionFromTest.fulfilled, (state, action) => {
        const test = action.payload;
        const index = state.tests.findIndex((t) => t.id === test.id);
        if (index !== -1) {
          state.tests[index] = test;
        }
        if (state.currentTest?.id === test.id) {
          state.currentTest = test;
        }
      });
  },
});

export const { clearError, setCurrentTest } = testSlice.actions;
export default testSlice.reducer; 