import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AdminAPI } from "../../api/userApi";
import { StaffUserItem } from "../../types/user.types";

interface UsersState {
  users: StaffUserItem[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchStaffUsers = createAsyncThunk(
  "users/fetchStaffUsers",
  async (filterParams: { role?: string; designation?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await AdminAPI.getUsersList({
        status: "ACTIVE",
        limit: 100,
        role: filterParams?.role,
        designation: filterParams?.designation,
      });

      // res.data is the array of staff users from backend
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch staff directory"
      );
    }
  }
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    invalidateUsersCache: (state) => {
      state.users = [];
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStaffUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchStaffUsers.fulfilled,
      (state, action: PayloadAction<StaffUserItem[]>) => {
        state.isLoading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetchedAt = Date.now();
      }
    );
    builder.addCase(fetchStaffUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.users = [];
      state.error = action.payload as string;
    });
  },
});

export const { invalidateUsersCache } = usersSlice.actions;
export default usersSlice.reducer;