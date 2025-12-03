import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});