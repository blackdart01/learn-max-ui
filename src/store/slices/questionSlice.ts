import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { QuestionState, Question } from '../../types';
import { questionService } from '../../services/api';

const initialState: QuestionState = {
  questions: [],
  loading: false,
  error: null,
};

export const fetchQuestions = createAsyncThunk(
  'questions/fetchAll',
  async () => {
    const response = await questionService.getAllQuestions();
    return response.data;
  }
);

export const addQuestion = createAsyncThunk(
  'questions/add',
  async (question: Omit<Question, 'id' | 'createdAt' | 'createdBy'>) => {
    const response = await questionService.addQuestion(question);
    return response.data;
  }
);

export const updateQuestion = createAsyncThunk(
  'questions/update',
  async ({ id, question }: { id: string; question: Partial<Question> }) => {
    const response = await questionService.updateQuestion(id, question);
    return response.data;
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/delete',
  async (id: string) => {
    await questionService.deleteQuestion(id);
    return id;
  }
);

const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      // Add question
      .addCase(addQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.push(action.payload);
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add question';
      })
      // Update question
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.questions.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update question';
      })
      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = state.questions.filter((q) => q.id !== action.payload);
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete question';
      });
  },
});

export const { clearError } = questionSlice.actions;
export default questionSlice.reducer; 