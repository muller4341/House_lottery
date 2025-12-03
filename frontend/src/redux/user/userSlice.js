import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ASYNC THUNK — ALWAYS GETS LATEST ROLE FROM DATABASE
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error("Unauthorized");
      return data.user; // ← comes from verifyUser (fresh from DB!)
    } catch (err) {
      return rejectWithValue(err.message);
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