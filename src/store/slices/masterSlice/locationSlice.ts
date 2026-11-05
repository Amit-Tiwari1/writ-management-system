
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchStates,
  createState,
  updateState,
  deleteState,

  fetchZones,
  createZone,
  updateZone,
  deleteZone,

  fetchRanges,
  createRange,
  updateRange,
  deleteRange,

  fetchDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "@/store/thunks/masterThunks/locationThunk";

import {
  IStateItem,
  IZoneItem,
  IRangeItem,
  IDistrictItem,
  PaginatedResponse,
} from "../../../types/master.types";

// =====================================================
// STATES
// =====================================================

interface StatesData {
  data: IStateItem[];
  totalCount: number;
  pagination: PaginatedResponse<IStateItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

interface StatesState {
  list: StatesData;
  options: StatesData;

  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;

  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;

  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
}

// =====================================================
// ZONES
// =====================================================

interface ZonesData {
  data: IZoneItem[];
  totalCount: number;
  pagination: PaginatedResponse<IZoneItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

interface ZonesState {
  list: ZonesData;
  options: ZonesData;

  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;

  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;

  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
}

// =====================================================
// RANGES
// =====================================================

interface RangesData {
  data: IRangeItem[];
  totalCount: number;
  pagination: PaginatedResponse<IRangeItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

interface RangesState {
  list: RangesData;
  options: RangesData;

  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;

  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;

  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
}

// =====================================================
// DISTRICTS
// =====================================================

interface DistrictsData {
  data: IDistrictItem[];
  totalCount: number;
  pagination: PaginatedResponse<IDistrictItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

interface DistrictsState {
  list: DistrictsData;
  options: DistrictsData;

  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;

  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;

  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
}

// =====================================================
// INITIAL DATA
// =====================================================

const initialStatesData: StatesData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

const initialZonesData: ZonesData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

const initialRangesData: RangesData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

const initialDistrictsData: DistrictsData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

// =====================================================
// LOCATION STATE
// =====================================================

interface LocationState {
  states: StatesState;
  zones: ZonesState;
  ranges: RangesState;
  districts: DistrictsState;
}

const initialState: LocationState = {
  states: {
    list: { ...initialStatesData },
    options: { ...initialStatesData },

    createLoading: false,
    createError: null,
    createSuccess: null,

    updateLoading: false,
    updateError: null,
    updateSuccess: null,

    deleteLoading: false,
    deleteError: null,
    deleteSuccess: null,
  },

  zones: {
    list: { ...initialZonesData },
    options: { ...initialZonesData },

    createLoading: false,
    createError: null,
    createSuccess: null,

    updateLoading: false,
    updateError: null,
    updateSuccess: null,

    deleteLoading: false,
    deleteError: null,
    deleteSuccess: null,
  },

  ranges: {
    list: { ...initialRangesData },
    options: { ...initialRangesData },

    createLoading: false,
    createError: null,
    createSuccess: null,

    updateLoading: false,
    updateError: null,
    updateSuccess: null,

    deleteLoading: false,
    deleteError: null,
    deleteSuccess: null,
  },

  districts: {
    list: { ...initialDistrictsData },
    options: { ...initialDistrictsData },

    createLoading: false,
    createError: null,
    createSuccess: null,

    updateLoading: false,
    updateError: null,
    updateSuccess: null,

    deleteLoading: false,
    deleteError: null,
    deleteSuccess: null,
  },
};

// =====================================================
// LOCATION SLICE
// =====================================================

const locationSlice = createSlice({
  name: "location",
  initialState,

  reducers: {
    // =====================================
    // CLEAR ALL LOCATION DATA
    // =====================================

    clearLocation: () => initialState,

    // =====================================
    // CLEAR STATES MESSAGES
    // =====================================

    clearStateMutationMessages: (state) => {
      state.states.createError = null;
      state.states.createSuccess = null;

      state.states.updateError = null;
      state.states.updateSuccess = null;

      state.states.deleteError = null;
      state.states.deleteSuccess = null;
    },

    // =====================================
    // CLEAR ZONES MESSAGES
    // =====================================

    clearZoneMutationMessages: (state) => {
      state.zones.createError = null;
      state.zones.createSuccess = null;

      state.zones.updateError = null;
      state.zones.updateSuccess = null;

      state.zones.deleteError = null;
      state.zones.deleteSuccess = null;
    },

    // =====================================
    // CLEAR RANGES MESSAGES
    // =====================================

    clearRangeMutationMessages: (state) => {
      state.ranges.createError = null;
      state.ranges.createSuccess = null;

      state.ranges.updateError = null;
      state.ranges.updateSuccess = null;

      state.ranges.deleteError = null;
      state.ranges.deleteSuccess = null;
    },

    // =====================================
    // CLEAR DISTRICTS MESSAGES
    // =====================================

    clearDistrictMutationMessages: (state) => {
      state.districts.createError = null;
      state.districts.createSuccess = null;

      state.districts.updateError = null;
      state.districts.updateSuccess = null;

      state.districts.deleteError = null;
      state.districts.deleteSuccess = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================
      // STATES - FETCH
      // =====================================

      .addCase(fetchStates.pending, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.states[view].loading = true;
        state.states[view].error = null;
      })

      .addCase(fetchStates.fulfilled, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.states[view].loading = false;
        state.states[view].data = action.payload.data;
        state.states[view].totalCount = action.payload.totalCount;
        state.states[view].pagination = action.payload.pagination;
      })

      .addCase(fetchStates.rejected, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.states[view].loading = false;
        state.states[view].error =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // STATES - CREATE
      // =====================================

      .addCase(createState.pending, (state) => {
        state.states.createLoading = true;
        state.states.createError = null;
        state.states.createSuccess = null;
      })

      .addCase(createState.fulfilled, (state, action) => {
        state.states.createLoading = false;
        state.states.createSuccess =
          action.payload.message || "State created successfully";
      })

      .addCase(createState.rejected, (state, action) => {
        state.states.createLoading = false;
        state.states.createError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // STATES - UPDATE
      // =====================================

      .addCase(updateState.pending, (state) => {
        state.states.updateLoading = true;
        state.states.updateError = null;
        state.states.updateSuccess = null;
      })

      .addCase(updateState.fulfilled, (state, action) => {
        state.states.updateLoading = false;
        state.states.updateSuccess =
          action.payload.message || "State updated successfully";
      })

      .addCase(updateState.rejected, (state, action) => {
        state.states.updateLoading = false;
        state.states.updateError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // STATES - DELETE
      // =====================================

      .addCase(deleteState.pending, (state) => {
        state.states.deleteLoading = true;
        state.states.deleteError = null;
        state.states.deleteSuccess = null;
      })

      .addCase(deleteState.fulfilled, (state, action) => {
        state.states.deleteLoading = false;
        state.states.deleteSuccess =
          action.payload.message || "State deleted successfully";
      })

      .addCase(deleteState.rejected, (state, action) => {
        state.states.deleteLoading = false;
        state.states.deleteError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // ZONES - FETCH
      // =====================================

      .addCase(fetchZones.pending, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.zones[view].loading = true;
        state.zones[view].error = null;
      })

      .addCase(fetchZones.fulfilled, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.zones[view].loading = false;
        state.zones[view].data = action.payload.data;
        state.zones[view].totalCount = action.payload.totalCount;
        state.zones[view].pagination = action.payload.pagination;
      })

      .addCase(fetchZones.rejected, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.zones[view].loading = false;
        state.zones[view].error =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // ZONES - CREATE
      // =====================================

      .addCase(createZone.pending, (state) => {
        state.zones.createLoading = true;
        state.zones.createError = null;
        state.zones.createSuccess = null;
      })

      .addCase(createZone.fulfilled, (state, action) => {
        state.zones.createLoading = false;
        state.zones.createSuccess =
          action.payload.message || "Zone created successfully";
      })

      .addCase(createZone.rejected, (state, action) => {
        state.zones.createLoading = false;
        state.zones.createError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // ZONES - UPDATE
      // =====================================

      .addCase(updateZone.pending, (state) => {
        state.zones.updateLoading = true;
        state.zones.updateError = null;
        state.zones.updateSuccess = null;
      })

      .addCase(updateZone.fulfilled, (state, action) => {
        state.zones.updateLoading = false;
        state.zones.updateSuccess =
          action.payload.message || "Zone updated successfully";
      })

      .addCase(updateZone.rejected, (state, action) => {
        state.zones.updateLoading = false;
        state.zones.updateError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // ZONES - DELETE
      // =====================================

      .addCase(deleteZone.pending, (state) => {
        state.zones.deleteLoading = true;
        state.zones.deleteError = null;
        state.zones.deleteSuccess = null;
      })

      .addCase(deleteZone.fulfilled, (state, action) => {
        state.zones.deleteLoading = false;
        state.zones.deleteSuccess =
          action.payload.message || "Zone deleted successfully";
      })

      .addCase(deleteZone.rejected, (state, action) => {
        state.zones.deleteLoading = false;
        state.zones.deleteError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // RANGES - FETCH
      // =====================================

      .addCase(fetchRanges.pending, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.ranges[view].loading = true;
        state.ranges[view].error = null;
      })

      .addCase(fetchRanges.fulfilled, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.ranges[view].loading = false;
        state.ranges[view].data = action.payload.data;
        state.ranges[view].totalCount = action.payload.totalCount;
        state.ranges[view].pagination = action.payload.pagination;
      })

      .addCase(fetchRanges.rejected, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.ranges[view].loading = false;
        state.ranges[view].error =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // RANGES - CREATE
      // =====================================

      .addCase(createRange.pending, (state) => {
        state.ranges.createLoading = true;
        state.ranges.createError = null;
        state.ranges.createSuccess = null;
      })

      .addCase(createRange.fulfilled, (state, action) => {
        state.ranges.createLoading = false;
        state.ranges.createSuccess =
          action.payload.message || "Range created successfully";
      })

      .addCase(createRange.rejected, (state, action) => {
        state.ranges.createLoading = false;
        state.ranges.createError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // RANGES - UPDATE
      // =====================================

      .addCase(updateRange.pending, (state) => {
        state.ranges.updateLoading = true;
        state.ranges.updateError = null;
        state.ranges.updateSuccess = null;
      })

      .addCase(updateRange.fulfilled, (state, action) => {
        state.ranges.updateLoading = false;
        state.ranges.updateSuccess =
          action.payload.message || "Range updated successfully";
      })

      .addCase(updateRange.rejected, (state, action) => {
        state.ranges.updateLoading = false;
        state.ranges.updateError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // RANGES - DELETE
      // =====================================

      .addCase(deleteRange.pending, (state) => {
        state.ranges.deleteLoading = true;
        state.ranges.deleteError = null;
        state.ranges.deleteSuccess = null;
      })

      .addCase(deleteRange.fulfilled, (state, action) => {
        state.ranges.deleteLoading = false;
        state.ranges.deleteSuccess =
          action.payload.message || "Range deleted successfully";
      })

      .addCase(deleteRange.rejected, (state, action) => {
        state.ranges.deleteLoading = false;
        state.ranges.deleteError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // DISTRICTS - FETCH
      // =====================================

      .addCase(fetchDistricts.pending, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.districts[view].loading = true;
        state.districts[view].error = null;
      })

      .addCase(fetchDistricts.fulfilled, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.districts[view].loading = false;
        state.districts[view].data = action.payload.data;
        state.districts[view].totalCount = action.payload.totalCount;
        state.districts[view].pagination = action.payload.pagination;
      })

      .addCase(fetchDistricts.rejected, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state.districts[view].loading = false;
        state.districts[view].error =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // DISTRICTS - CREATE
      // =====================================

      .addCase(createDistrict.pending, (state) => {
        state.districts.createLoading = true;
        state.districts.createError = null;
        state.districts.createSuccess = null;
      })

      .addCase(createDistrict.fulfilled, (state, action) => {
        state.districts.createLoading = false;
        state.districts.createSuccess =
          action.payload.message || "District created successfully";
      })

      .addCase(createDistrict.rejected, (state, action) => {
        state.districts.createLoading = false;
        state.districts.createError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // DISTRICTS - UPDATE
      // =====================================

      .addCase(updateDistrict.pending, (state) => {
        state.districts.updateLoading = true;
        state.districts.updateError = null;
        state.districts.updateSuccess = null;
      })

      .addCase(updateDistrict.fulfilled, (state, action) => {
        state.districts.updateLoading = false;
        state.districts.updateSuccess =
          action.payload.message || "District updated successfully";
      })

      .addCase(updateDistrict.rejected, (state, action) => {
        state.districts.updateLoading = false;
        state.districts.updateError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =====================================
      // DISTRICTS - DELETE
      // =====================================

      .addCase(deleteDistrict.pending, (state) => {
        state.districts.deleteLoading = true;
        state.districts.deleteError = null;
        state.districts.deleteSuccess = null;
      })

      .addCase(deleteDistrict.fulfilled, (state, action) => {
        state.districts.deleteLoading = false;
        state.districts.deleteSuccess =
          action.payload.message || "District deleted successfully";
      })

      .addCase(deleteDistrict.rejected, (state, action) => {
        state.districts.deleteLoading = false;
        state.districts.deleteError =
          action.payload || action.error.message || "Something went wrong";
      });
  },
});

// =====================================================
// EXPORT ACTIONS
// =====================================================

export const {
  clearLocation,
  clearStateMutationMessages,
  clearZoneMutationMessages,
  clearRangeMutationMessages,
  clearDistrictMutationMessages,
} = locationSlice.actions;

export default locationSlice.reducer;
