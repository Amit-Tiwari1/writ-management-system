import { createSlice } from "@reduxjs/toolkit";

import type {
  IActionMappingItem,
  PaginatedResponse,
} from "@/types/master.types";

import {
  fetchActionMappings,
  createActionMapping,
  updateActionMapping,
  deleteActionMapping,
} from "@/store/thunks/masterThunks/actionMappingsThunks";

interface ActionMappingsState {
  list: {
    data: IActionMappingItem[];
    totalCount: number;
    pagination: {
      page: number;
      limit: number;
      pages: number;
    } | null;
    loading: boolean;
    error: string | null;
  };

  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  mutationError: string | null;
}

const initialState: ActionMappingsState = {
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

const actionMappingsSlice = createSlice({
  name: "actionMappings",
  initialState,

  reducers: {
    clearActionMappingsError: (state) => {
      state.list.error = null;
      state.mutationError = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH ACTION MAPPINGS
    builder
      .addCase(fetchActionMappings.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchActionMappings.fulfilled, (state, action) => {
        state.list.loading = false;

        state.list.data = action.payload.data;
        state.list.totalCount = action.payload.totalCount;
        state.list.pagination = action.payload.pagination;
      })
      .addCase(fetchActionMappings.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error =
          action.payload || "Failed to fetch action mapping rules";
      });

    // CREATE ACTION MAPPING
    builder
      .addCase(createActionMapping.pending, (state) => {
        state.createLoading = true;
        state.mutationError = null;
      })
      .addCase(createActionMapping.fulfilled, (state, action) => {
        state.createLoading = false;

        if (action.payload.data) {
          state.list.data = [
            action.payload.data,
            ...state.list.data,
          ];
          state.list.totalCount += 1;
        }
      })
      .addCase(createActionMapping.rejected, (state, action) => {
        state.createLoading = false;
        state.mutationError =
          action.payload || "Failed to create action mapping rule";
      });

    // UPDATE ACTION MAPPING
    builder
      .addCase(updateActionMapping.pending, (state) => {
        state.updateLoading = true;
        state.mutationError = null;
      })
      .addCase(updateActionMapping.fulfilled, (state, action) => {
        state.updateLoading = false;

        if (action.payload.data) {
          const updatedItem = action.payload.data;

          state.list.data = state.list.data.map((item) =>
            item._id === updatedItem._id ? updatedItem : item
          );
        }
      })
      .addCase(updateActionMapping.rejected, (state, action) => {
        state.updateLoading = false;
        state.mutationError =
          action.payload || "Failed to update action mapping rule";
      });

    // DELETE ACTION MAPPING
    builder
      .addCase(deleteActionMapping.pending, (state) => {
        state.deleteLoading = true;
        state.mutationError = null;
      })
      .addCase(deleteActionMapping.fulfilled, (state) => {
        state.deleteLoading = false;
      })
      .addCase(deleteActionMapping.rejected, (state, action) => {
        state.deleteLoading = false;
        state.mutationError =
          action.payload || "Failed to delete action mapping rule";
      });
  },
});

export const { clearActionMappingsError } =
  actionMappingsSlice.actions;

export default actionMappingsSlice.reducer;