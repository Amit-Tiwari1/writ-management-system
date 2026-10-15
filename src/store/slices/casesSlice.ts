import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CasesAPI, DropdownWritItem } from "@/api/casesApi";

interface CasesState {
  dropdownWrits: DropdownWritItem[];
  isLoadingDropdown: boolean;
  hasFetchedDropdown: boolean;
  error: string | null;
}

const initialState: CasesState = {
  dropdownWrits: [],
  isLoadingDropdown: false,
  hasFetchedDropdown: false,
  error: null,
};

export const fetchDropdownWritsThunk = createAsyncThunk(
  "cases/fetchDropdownWritsThunk",
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cases?: CasesState };
      if (!forceRefresh && state.cases?.hasFetchedDropdown && state.cases.dropdownWrits.length > 0) {
        return { data: state.cases.dropdownWrits, skipped: true };
      }

      const res = await CasesAPI.getDropdownWritsList();
      if (res.success) {
        return { data: res.data, skipped: false };
      }
      return rejectWithValue("Failed to fetch writs list.");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Network error");
    }
  }
);

export const casesSlice = createSlice({
  name: "cases",
  initialState,
  reducers: {
    clearCasesError: (state) => {
      state.error = null;
    },
    invalidateDropdownWrits: (state) => {
      state.hasFetchedDropdown = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDropdownWritsThunk.pending, (state) => {
      if (!state.hasFetchedDropdown) {
        state.isLoadingDropdown = true;
      }
      state.error = null;
    });
    builder.addCase(fetchDropdownWritsThunk.fulfilled, (state, action: PayloadAction<{ data: DropdownWritItem[]; skipped: boolean }>) => {
      state.isLoadingDropdown = false;
      state.hasFetchedDropdown = true;
      state.dropdownWrits = action.payload.data;
    });
    builder.addCase(fetchDropdownWritsThunk.rejected, (state, action) => {
      state.isLoadingDropdown = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCasesError, invalidateDropdownWrits } = casesSlice.actions;
export default casesSlice.reducer;