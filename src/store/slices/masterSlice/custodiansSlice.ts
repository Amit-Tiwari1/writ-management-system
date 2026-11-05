import { createSlice } from "@reduxjs/toolkit";

import {
  fetchSubjectCustodians,
  createCustodian,
  updateCustodian,
  deleteCustodian,
} from "@/store/thunks/masterThunks/custodiansThunks";

import {
  ICustodianRecord,
  PaginatedResponse,
} from "../../../types/master.types";

interface CustodiansData {
  data: ICustodianRecord[];
  totalCount: number;
  pagination: PaginatedResponse<ICustodianRecord>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

interface CustodiansState {
  list: CustodiansData;
  options: CustodiansData;

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

const createInitialData = (): CustodiansData => ({
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
});

const initialState: CustodiansState = {
  list: createInitialData(),
  options: createInitialData(),

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

const custodiansSlice = createSlice({
  name: "custodians",
  initialState,

  reducers: {
    clearCustodians: () => ({
      list: createInitialData(),
      options: createInitialData(),
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

    clearCustodianMutationMessages: (state) => {
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
      .addCase(fetchSubjectCustodians.pending, (state, action) => {
        const view = action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = true;
        state[view].error = null;
      })

      .addCase(fetchSubjectCustodians.fulfilled, (state, action) => {
        console.log("🟣 REDUX PAYLOAD:", action.payload);
        console.log("🟣 REDUX DATA:", action.payload?.data);

        const view = action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = false;
        state[view].error = null;

        state[view].data = action.payload.data;
        state[view].totalCount = action.payload.totalCount;
        state[view].pagination = action.payload.pagination;
      })

      .addCase(fetchSubjectCustodians.rejected, (state, action) => {
        const view = action.meta.arg?.view === "options" ? "options" : "list";

        state[view].loading = false;
        state[view].error =
          action.payload ||
          action.error.message ||
          "Failed to fetch custodian records.";
      })
      .addCase(createCustodian.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })

      .addCase(createCustodian.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess =
          action.payload.message || "Custodian created successfully.";
      })

      .addCase(createCustodian.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload ||
          action.error.message ||
          "Failed to create custodian.";
      })
      .addCase(updateCustodian.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })

      .addCase(updateCustodian.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess =
          action.payload.message || "Custodian updated successfully.";
      })

      .addCase(updateCustodian.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload ||
          action.error.message ||
          "Failed to update custodian.";
      })
      .addCase(deleteCustodian.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })

      .addCase(deleteCustodian.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess =
          action.payload.message || "Custodian deleted successfully.";
      })

      .addCase(deleteCustodian.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload ||
          action.error.message ||
          "Failed to delete custodian.";
      });
  },
});

export const { clearCustodians, clearCustodianMutationMessages } =
  custodiansSlice.actions;

export default custodiansSlice.reducer;
