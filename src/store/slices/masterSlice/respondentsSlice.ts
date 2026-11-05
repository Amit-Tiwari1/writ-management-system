
import { createSlice } from "@reduxjs/toolkit";

import type { IRespondentGroupItem } from "@/types/master.types";

import {
  fetchRespondentGroups,
  createRespondentGroup,
  updateRespondentGroup,
  deleteRespondentGroup,
} from "@/store/thunks/masterThunks/respondentsThunks";

interface RespondentsListState {
  data: IRespondentGroupItem[];
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

interface RespondentsState {
  list: RespondentsListState;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  mutationError: string | null;
}

const initialState: RespondentsState = {
  list: {
    data: [],
    totalCount: 0,
    pagination: null,
    loading: false,
    error: null,
  },
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  mutationError: null,
};

const respondentsSlice = createSlice({
  name: "respondents",
  initialState,

  reducers: {
    clearRespondentsError: (state) => {
      state.list.error = null;
      state.mutationError = null;
    },

    clearRespondents: (state) => {
      state.list.data = [];
      state.list.totalCount = 0;
      state.list.pagination = null;
      state.list.error = null;
      state.mutationError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchRespondentGroups.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchRespondentGroups.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.error = null;
        state.list.data = action.payload.data || [];
        state.list.totalCount = action.payload.totalCount || 0;
        state.list.pagination = action.payload.pagination || null;
      })
      .addCase(fetchRespondentGroups.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error =
          action.payload || "Failed to load respondent groups";
      })

      // CREATE
      .addCase(createRespondentGroup.pending, (state) => {
        state.createLoading = true;
        state.mutationError = null;
      })
      .addCase(createRespondentGroup.fulfilled, (state) => {
        state.createLoading = false;
        state.mutationError = null;
      })
      .addCase(createRespondentGroup.rejected, (state, action) => {
        state.createLoading = false;
        state.mutationError =
          action.payload || "Failed to create respondent group";
      })

      // UPDATE
      .addCase(updateRespondentGroup.pending, (state) => {
        state.updateLoading = true;
        state.mutationError = null;
      })
      .addCase(updateRespondentGroup.fulfilled, (state) => {
        state.updateLoading = false;
        state.mutationError = null;
      })
      .addCase(updateRespondentGroup.rejected, (state, action) => {
        state.updateLoading = false;
        state.mutationError =
          action.payload || "Failed to update respondent group";
      })

      // DELETE
      .addCase(deleteRespondentGroup.pending, (state) => {
        state.deleteLoading = true;
        state.mutationError = null;
      })
      .addCase(deleteRespondentGroup.fulfilled, (state) => {
        state.deleteLoading = false;
        state.mutationError = null;
      })
      .addCase(deleteRespondentGroup.rejected, (state, action) => {
        state.deleteLoading = false;
        state.mutationError =
          action.payload || "Failed to delete respondent group";
      });
  },
});

export const {
  clearRespondentsError,
  clearRespondents,
} = respondentsSlice.actions;

export default respondentsSlice.reducer;
