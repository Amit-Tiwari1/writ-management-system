import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MastersAPI, IntakeDropdownBundle } from "../../api/mastersApi";

interface MastersState {
  dropdowns: IntakeDropdownBundle | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: MastersState = {
  dropdowns: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchIntakeDropdowns = createAsyncThunk(
  "masters/fetchIntakeDropdowns",
  async (_, { rejectWithValue }) => {
    try {
      const res = await MastersAPI.getIntakeDropdowns();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch master dropdowns");
    }
  }
);

export const mastersSlice = createSlice({
  name: "masters",
  initialState,
  reducers: {
    invalidateMastersCache: (state) => {
      state.dropdowns = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchIntakeDropdowns.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchIntakeDropdowns.fulfilled, (state, action: PayloadAction<IntakeDropdownBundle>) => {
      state.isLoading = false;
      state.dropdowns = action.payload;
      state.lastFetchedAt = Date.now();
    });
    builder.addCase(fetchIntakeDropdowns.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { invalidateMastersCache } = mastersSlice.actions;
export default mastersSlice.reducer;