import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CasesAPI, DropdownWritItem, CaseFilterQuery } from "@/api/casesApi";
import { CaseItem, CasesPagination, PillsMetrics } from "@/types/case.types";

interface CasesState {
  dropdownWrits: DropdownWritItem[];
  isLoadingDropdown: boolean;
  hasFetchedDropdown: boolean;

  casesList: CaseItem[];
  pagination: CasesPagination;
  pillsMetrics: PillsMetrics;
  isLoadingCases: boolean;
  activeFilterQuery: CaseFilterQuery;

  selectedCaseDossier: CaseItem | null;
  isLoadingDossier: boolean;

  error: string | null;
}

const initialState: CasesState = {
  dropdownWrits: [],
  isLoadingDropdown: false,
  hasFetchedDropdown: false,

  casesList: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  pillsMetrics: { all: 0, withConnected: 0, advanceNotice: 0, stayInForce: 0, contemptAlerts: 0 },
  isLoadingCases: false,
  activeFilterQuery: { page: 1, limit: 10, search: "", court: "ALL", wing: "ALL", statusFilter: "" },

  selectedCaseDossier: null,
  isLoadingDossier: false,

  error: null,
};

// Global Fetch for Dropdowns (Used across DMS, Green Sheet Notings, Compliance)
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

// Global Fetch for 2.1 Case Register
export const fetchCasesListThunk = createAsyncThunk(
  "cases/fetchCasesListThunk",
  async (filters: CaseFilterQuery, { rejectWithValue }) => {
    try {
      const res = await CasesAPI.getCases(filters);
      if (res.success) {
        return { ...res, filters };
      }
      return rejectWithValue("Failed to load cases registry.");
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
    setActiveFilterQuery: (state, action: PayloadAction<Partial<CaseFilterQuery>>) => {
      state.activeFilterQuery = { ...state.activeFilterQuery, ...action.payload };
    },
    setSelectedCaseDossier: (state, action: PayloadAction<CaseItem | null>) => {
      state.selectedCaseDossier = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dropdowns
    builder.addCase(fetchDropdownWritsThunk.pending, (state) => {
      if (!state.hasFetchedDropdown) state.isLoadingDropdown = true;
      state.error = null;
    });
    builder.addCase(fetchDropdownWritsThunk.fulfilled, (state, action) => {
      state.isLoadingDropdown = false;
      state.hasFetchedDropdown = true;
      state.dropdownWrits = action.payload.data;
    });
    builder.addCase(fetchDropdownWritsThunk.rejected, (state, action) => {
      state.isLoadingDropdown = false;
      state.error = action.payload as string;
    });

    // 2.1 Cases List
    builder.addCase(fetchCasesListThunk.pending, (state) => {
      state.isLoadingCases = true;
      state.error = null;
    });
    builder.addCase(fetchCasesListThunk.fulfilled, (state, action) => {
      state.isLoadingCases = false;
      state.casesList = action.payload.data;
      state.pagination = action.payload.pagination;
      state.pillsMetrics = action.payload.pillsMetrics;
      state.activeFilterQuery = action.payload.filters;
    });
    builder.addCase(fetchCasesListThunk.rejected, (state, action) => {
      state.isLoadingCases = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearCasesError,
  invalidateDropdownWrits,
  setActiveFilterQuery,
  setSelectedCaseDossier,
} = casesSlice.actions;

export default casesSlice.reducer;