import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ASYNC THUNK — ALWAYS GETS LATEST ROLE FROM DATABASE
// src/redux/user/userSlice.js  (or wherever it is)
// src/features/user/userSlice.js  ← FINAL VERSION
// src/features/user/userSlice.js  ← FINAL VERSION
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include",
      });

      // ALWAYS parse JSON first
      const data = await res.json();

      // Check both status AND data.success
      if (!res.ok || !data.success) {
        console.log("fetchCurrentUser failed:", res.status, data);
        return rejectWithValue(data.message || "Unauthorized");
      }

      console.log("USER LOADED FROM /api/user/me:", data.user);
      return data.user;  // ← this goes to fulfilled → state.user = data.user
    } catch (err) {
      console.log("fetchCurrentUser error:", err);
      return rejectWithValue("Network error");
    }
  }
);
const initialState = {
  user: null,        // ← changed from currentUser to user
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.loading = true;
    },
    updateSuccess: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.loading = false;
        state.error = "Session expired";
      });
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFail,
  updateStart,
  updateSuccess,
  updateFail,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFail,
  signOutSuccess,
} = userSlice.actions;

export default userSlice.reducer;