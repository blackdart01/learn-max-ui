import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import questionReducer from './slices/questionSlice';
import testReducer from './slices/testSlice';
import attemptReducer from './slices/attemptSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionReducer,
    tests: testReducer,
    attempts: attemptReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 