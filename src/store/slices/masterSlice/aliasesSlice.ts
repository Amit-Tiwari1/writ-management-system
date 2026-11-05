
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  IAliasItem,
  IStandingCounselItem,
} from "@/types/master.types";

import {
  fetchAliases,
  createAlias,
  updateAlias,
  deleteAlias,
  fetchStandingCounsels,
  createStandingCounsel,
  updateStandingCounsel,
  deleteStandingCounsel,
} from "@/store/thunks/masterThunks/aliasesThunks";

/* =========================================================
   TYPES
========================================================= */

interface MasterListState<T> {
  data: T[];
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

interface AliasesState {
  aliases: MasterListState<IAliasItem>;
  standingCounsels: MasterListState<IStandingCounselItem>;

  mutations: {
    createAliasLoading: boolean;
    updateAliasLoading: boolean;
    deleteAliasLoading: boolean;

    createStandingCounselLoading: boolean;
    updateStandingCounselLoading: boolean;
    deleteStandingCounselLoading: boolean;

    error: string | null;
  };
}

/* =========================================================
   INITIAL STATE
========================================================= */

const initialListState = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

const initialState: AliasesState = {
  aliases: { ...initialListState },
  standingCounsels: { ...initialListState },

  mutations: {
    createAliasLoading: false,
    updateAliasLoading: false,
    deleteAliasLoading: false,

    createStandingCounselLoading: false,
    updateStandingCounselLoading: false,
    deleteStandingCounselLoading: false,

    error: null,
  },
};

/* =========================================================
   SLICE
========================================================= */

const aliasesSlice = createSlice({
  name: "aliases",
  initialState,

  reducers: {
    clearAliasesError: (state) => {
      state.aliases.error = null;
      state.mutations.error = null;
    },

    clearStandingCounselsError: (state) => {
      state.standingCounsels.error = null;
      state.mutations.error = null;
    },

    clearAliasesState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       ALIAS: FETCH
    ===================================================== */

    builder
      .addCase(fetchAliases.pending, (state) => {
        state.aliases.loading = true;
        state.aliases.error = null;
      })
      .addCase(fetchAliases.fulfilled, (state, action) => {
        state.aliases.loading = false;
        state.aliases.data = action.payload.data;
        state.aliases.totalCount = action.payload.totalCount;
        state.aliases.pagination = action.payload.pagination;
      })
      .addCase(fetchAliases.rejected, (state, action) => {
        state.aliases.loading = false;
        state.aliases.error =
          action.payload || "Failed to fetch aliases";
      });

    /* =====================================================
       ALIAS: CREATE
    ===================================================== */

    builder
      .addCase(createAlias.pending, (state) => {
        state.mutations.createAliasLoading = true;
        state.mutations.error = null;
      })
      .addCase(createAlias.fulfilled, (state, action) => {
        state.mutations.createAliasLoading = false;

        state.aliases.data.unshift(action.payload);
        state.aliases.totalCount += 1;
      })
      .addCase(createAlias.rejected, (state, action) => {
        state.mutations.createAliasLoading = false;
        state.mutations.error =
          action.payload || "Failed to create alias";
      });

    /* =====================================================
       ALIAS: UPDATE
    ===================================================== */

    builder
      .addCase(updateAlias.pending, (state) => {
        state.mutations.updateAliasLoading = true;
        state.mutations.error = null;
      })
      .addCase(updateAlias.fulfilled, (state, action) => {
        state.mutations.updateAliasLoading = false;

        const index = state.aliases.data.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.aliases.data[index] = action.payload;
        }
      })
      .addCase(updateAlias.rejected, (state, action) => {
        state.mutations.updateAliasLoading = false;
        state.mutations.error =
          action.payload || "Failed to update alias";
      });

    /* =====================================================
       ALIAS: DELETE
    ===================================================== */

    builder
      .addCase(deleteAlias.pending, (state) => {
        state.mutations.deleteAliasLoading = true;
        state.mutations.error = null;
      })
      .addCase(deleteAlias.fulfilled, (state, action) => {
        state.mutations.deleteAliasLoading = false;

        state.aliases.data = state.aliases.data.filter(
          (item) => item._id !== action.payload
        );

        state.aliases.totalCount = Math.max(
          0,
          state.aliases.totalCount - 1
        );
      })
      .addCase(deleteAlias.rejected, (state, action) => {
        state.mutations.deleteAliasLoading = false;
        state.mutations.error =
          action.payload || "Failed to delete alias";
      });

    /* =====================================================
       STANDING COUNSEL: FETCH
    ===================================================== */

    builder
      .addCase(fetchStandingCounsels.pending, (state) => {
        state.standingCounsels.loading = true;
        state.standingCounsels.error = null;
      })
      .addCase(fetchStandingCounsels.fulfilled, (state, action) => {
        state.standingCounsels.loading = false;
        state.standingCounsels.data = action.payload.data;
        state.standingCounsels.totalCount =
          action.payload.totalCount;
        state.standingCounsels.pagination =
          action.payload.pagination;
      })
      .addCase(fetchStandingCounsels.rejected, (state, action) => {
        state.standingCounsels.loading = false;
        state.standingCounsels.error =
          action.payload || "Failed to fetch standing counsels";
      });

    /* =====================================================
       STANDING COUNSEL: CREATE
    ===================================================== */

    builder
      .addCase(createStandingCounsel.pending, (state) => {
        state.mutations.createStandingCounselLoading = true;
        state.mutations.error = null;
      })
      .addCase(createStandingCounsel.fulfilled, (state, action) => {
        state.mutations.createStandingCounselLoading = false;

        state.standingCounsels.data.unshift(action.payload);
        state.standingCounsels.totalCount += 1;
      })
      .addCase(createStandingCounsel.rejected, (state, action) => {
        state.mutations.createStandingCounselLoading = false;
        state.mutations.error =
          action.payload || "Failed to create standing counsel";
      });

    /* =====================================================
       STANDING COUNSEL: UPDATE
    ===================================================== */

    builder
      .addCase(updateStandingCounsel.pending, (state) => {
        state.mutations.updateStandingCounselLoading = true;
        state.mutations.error = null;
      })
      .addCase(updateStandingCounsel.fulfilled, (state, action) => {
        state.mutations.updateStandingCounselLoading = false;

        const index = state.standingCounsels.data.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.standingCounsels.data[index] = action.payload;
        }
      })
      .addCase(updateStandingCounsel.rejected, (state, action) => {
        state.mutations.updateStandingCounselLoading = false;
        state.mutations.error =
          action.payload || "Failed to update standing counsel";
      });

    /* =====================================================
       STANDING COUNSEL: DELETE
    ===================================================== */

    builder
      .addCase(deleteStandingCounsel.pending, (state) => {
        state.mutations.deleteStandingCounselLoading = true;
        state.mutations.error = null;
      })
      .addCase(deleteStandingCounsel.fulfilled, (state, action) => {
        state.mutations.deleteStandingCounselLoading = false;

        state.standingCounsels.data =
          state.standingCounsels.data.filter(
            (item) => item._id !== action.payload
          );

        state.standingCounsels.totalCount = Math.max(
          0,
          state.standingCounsels.totalCount - 1
        );
      })
      .addCase(deleteStandingCounsel.rejected, (state, action) => {
        state.mutations.deleteStandingCounselLoading = false;
        state.mutations.error =
          action.payload || "Failed to delete standing counsel";
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  clearAliasesError,
  clearStandingCounselsError,
  clearAliasesState,
} = aliasesSlice.actions;

export default aliasesSlice.reducer;
