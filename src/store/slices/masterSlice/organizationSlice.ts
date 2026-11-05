
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/store/thunks/masterThunks/organizationThunk";

import {
  IDepartmentItem,
  PaginatedResponse,
} from "@/types/master.types";

// =====================================================
// DEPARTMENTS DATA
// =====================================================

interface DepartmentsData {
  data: IDepartmentItem[];
  totalCount: number;
  pagination: PaginatedResponse<IDepartmentItem>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

// =====================================================
// DEPARTMENTS STATE
// =====================================================

interface DepartmentsState {
  list: DepartmentsData;
  options: DepartmentsData;

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

const initialData: DepartmentsData = {
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: DepartmentsState = {
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
// ORGANIZATION SLICE
// =====================================================

const organizationSlice = createSlice({
  name: "organization",
  initialState,

  reducers: {
    // =====================================
    // CLEAR DEPARTMENTS DATA
    // =====================================

    clearDepartments: () => ({
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

    clearDepartmentMutationMessages: (state) => {
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
      // FETCH DEPARTMENTS
      // =================================================

      .addCase(fetchDepartments.pending, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = true;
        state[view].error = null;
      })

      .addCase(fetchDepartments.fulfilled, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = false;
        state[view].data = action.payload.data;
        state[view].totalCount = action.payload.totalCount;
        state[view].pagination = action.payload.pagination;
        state[view].error = null;
      })

      .addCase(fetchDepartments.rejected, (state, action) => {
        const view =
          action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = false;
        state[view].error =
          action.payload || action.error.message || "Something went wrong";
      })

      // =================================================
      // CREATE DEPARTMENT
      // =================================================

      .addCase(createDepartment.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })

      .addCase(createDepartment.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess =
          action.payload.message || "Department created successfully";
      })

      .addCase(createDepartment.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =================================================
      // UPDATE DEPARTMENT
      // =================================================

      .addCase(updateDepartment.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })

      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess =
          action.payload.message || "Department updated successfully";
      })

      .addCase(updateDepartment.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || action.error.message || "Something went wrong";
      })

      // =================================================
      // DELETE DEPARTMENT
      // =================================================

      .addCase(deleteDepartment.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })

      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess =
          action.payload.message || "Department deleted successfully";
      })

      .addCase(deleteDepartment.rejected, (state, action) => {
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
  clearDepartments,
  clearDepartmentMutationMessages,
} = organizationSlice.actions;

// =====================================================
// EXPORT REDUCER
// =====================================================

export default organizationSlice.reducer;
