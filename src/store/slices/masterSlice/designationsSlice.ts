import { createSlice } from "@reduxjs/toolkit";
import type { IDesignationItem, PaginatedResponse } from "@/types/master.types";

import {
  fetchDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "@/store/thunks/masterThunks/designationThunk";

type DesignationsData = {
  data: IDesignationItem[];
  totalCount: number;
  pagination: PaginatedResponse<IDesignationItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
};

interface DesignationsState {
  list: DesignationsData;
  options: DesignationsData;

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

const initialData: DesignationsData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

const initialState: DesignationsState = {
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

const getMessage = (value: unknown, fallback: string): string => {
  return typeof value === "string" ? value : fallback;
};

const designationsSlice = createSlice({
  name: "designations",
  initialState,
  reducers: {
    clearDesignations: (state) => {
      state.list = { ...initialData };
      state.options = { ...initialData };
    },

    clearDesignationMutationMessages: (state) => {
      state.createError = null;
      state.createSuccess = null;

      state.updateError = null;
      state.updateSuccess = null;

      state.deleteError = null;
      state.deleteSuccess = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH DESIGNATIONS
    builder
      .addCase(fetchDesignations.pending, (state, action) => {
        const target =
          action.meta.arg?.view === "options" ? state.options : state.list;

        target.loading = true;
        target.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        const target =
          action.meta.arg?.view === "options" ? state.options : state.list;

        target.loading = false;
        target.data = action.payload?.data ?? [];
        target.totalCount = action.payload?.totalCount ?? 0;
        target.pagination = action.payload?.pagination ?? null;
        target.error = null;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        const target =
          action.meta.arg?.view === "options" ? state.options : state.list;

        target.loading = false;
        target.error = getMessage(
          action.payload,
          action.error.message || "Failed to fetch designations",
        );
      });

    // CREATE DESIGNATION
    builder
      .addCase(createDesignation.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createDesignation.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess =
          action.payload?.message || "Designation created successfully";
      })
      .addCase(createDesignation.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = getMessage(
          action.payload,
          action.error.message || "Failed to create designation",
        );
      });

    // UPDATE DESIGNATION
    builder
      .addCase(updateDesignation.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateDesignation.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess =
          action.payload?.message || "Designation updated successfully";
      })
      .addCase(updateDesignation.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = getMessage(
          action.payload,
          action.error.message || "Failed to update designation",
        );
      });

    // DELETE DESIGNATION
    builder
      .addCase(deleteDesignation.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess =
          action.payload?.message || "Designation deleted successfully";
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = getMessage(
          action.payload,
          action.error.message || "Failed to delete designation",
        );
      });
  },
});

export const {
  clearDesignations,
  clearDesignationMutationMessages,
} = designationsSlice.actions;

export default designationsSlice.reducer;