// store.js — FINAL CORRECT VERSION
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../user/userSlice';  // make sure path is correct

export const store = configureStore({
  reducer: {
    user: userReducer,    // ← MUST BE "user"
  },
});