import { createSlice } from "@reduxjs/toolkit";

import {
  fetchRanks,
  createRank,
  updateRank,
  deleteRank,
} from "@/store/thunks/masterThunks/ranksThunk";

import {
  IRankItem,
  PaginatedResponse,
} from "../../../types/master.types";



interface RanksData {
  data: IRankItem[];
  totalCount: number;
  pagination: PaginatedResponse<IRankItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

// =====================================================
// RANKS STATE
// =====================================================

interface RanksState {
  list: RanksData;
  options: RanksData;

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

const initialData: RanksData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: RanksState = {
  list: { ...initialData },
  options: { ...initialData },

  createLoading: false,
  createError: null,
  createSuccess: null,

  updateLoading: false,
  updateError: null,
  updateSuccess: null,

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: null,
};

// =====================================================
// RANKS SLICE
// =====================================================

const ranksSlice = createSlice({
  name: "ranks",
  initialState,

  reducers: {
    // =====================================
    // CLEAR RANKS DATA
    // =====================================

    clearRanks: () => ({
      list: { ...initialData },
      options: { ...initialData },

      createLoading: false,
      createError: null,
      createSuccess: null,

      updateLoading: false,
      updateError: null,
      updateSuccess: null,

      deleteLoading: false,
      deleteError: null,
      deleteSuccess: null,
    }),

    // =====================================
    // CLEAR MUTATION MESSAGES
    // =====================================

    clearRankMutationMessages: (state) => {
      state.createError = null;
      state.createSuccess = null;

      state.updateError = null;
      state.updateSuccess = null;

      state.deleteError = null;
      state.deleteSuccess = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // FETCH RANKS
      // =================================================

      .addCase(fetchRanks.pending, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = true;
        state[view].error = null;
      })

      .addCase(fetchRanks.fulfilled, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = false;
        state[view].data = action.payload.data;
        state[view].totalCount = action.payload.totalCount;
        state[view].pagination = action.payload.pagination;
      })

      .addCase(fetchRanks.rejected, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = false;
        state[view].error =
          action.payload || action.error.message || "Something went wrong";
      })

      // =================================================
      // CREATE RANK
      // =================================================

      .addCase(createRank.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })

      .addCase(createRank.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess =
          action.payload.message || "Rank created successfully";
      })

      .addCase(createRank.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =================================================
      // UPDATE RANK
      // =================================================

      .addCase(updateRank.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })

      .addCase(updateRank.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess =
          action.payload.message || "Rank updated successfully";
      })

      .addCase(updateRank.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =================================================
      // DELETE RANK
      // =================================================

      .addCase(deleteRank.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })

      .addCase(deleteRank.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess =
          action.payload.message || "Rank deleted successfully";
      })

      .addCase(deleteRank.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload || action.error.message || "Something went wrong";
      });
  },
});

// =====================================================
// EXPORT ACTIONS
// =====================================================

export const {
  clearRanks,
  clearRankMutationMessages,
} = ranksSlice.actions;

// =====================================================
// EXPORT REDUCER
// =====================================================

export default ranksSlice.reducer;