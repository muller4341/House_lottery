import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch the current authenticated user from the backend
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token');

      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.success) {
        return rejectWithValue(res.data.message || 'Unauthorized');
      }

      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Network error');
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInSuccess: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    signOutSuccess: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.loading = false;
        state.error = 'Session expired';
      });
  },
});

export const { signInSuccess, signOutSuccess } = userSlice.actions;
export default userSlice.reducer;