import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  fetchCaseTypes,
  createCaseType,
  updateCaseType,
  deleteCaseType,
} from "@/store/thunks/masterThunks/judicialThunk";

import {
  ICourtItem,
  ICaseTypeItem,
  PaginatedResponse,
} from "@/types/master.types";

interface MasterData<T> {
  data: T[];
  totalCount: number;
  pagination: PaginatedResponse<T>["pagination"] | null;
  loading: boolean;
  error: string | null;
}

interface MutationState {
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

interface JudicialMasterState<T> extends MutationState {
  list: MasterData<T>;
  options: MasterData<T>;
}

interface JudicialCourtsState {
  courts: JudicialMasterState<ICourtItem>;
  caseTypes: JudicialMasterState<ICaseTypeItem>;
}

const initialData = <T>(): MasterData<T> => ({
  data: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  error: null,
});

const initialMutationState: MutationState = {
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

const initialMasterState = <T>(): JudicialMasterState<T> => ({
  list: initialData<T>(),
  options: initialData<T>(),
  ...initialMutationState,
});

const initialState: JudicialCourtsState = {
  courts: initialMasterState<ICourtItem>(),
  caseTypes: initialMasterState<ICaseTypeItem>(),
};

const getResponseMessage = (payload: unknown, fallback: string) => {
  const response = payload as {
    message?: string;
  };

  return response?.message || fallback;
};

const getRejectedMessage = (
  payload: unknown,
  fallback: string,
) => {
  return typeof payload === "string" ? payload : fallback;
};

const judicialCourtsSlice = createSlice({
  name: "judicialCourts",
  initialState,

  reducers: {
    clearJudicialCourts(state) {
      state.courts.list = initialData<ICourtItem>();
      state.courts.options = initialData<ICourtItem>();
    },

    clearCaseTypes(state) {
      state.caseTypes.list = initialData<ICaseTypeItem>();
      state.caseTypes.options = initialData<ICaseTypeItem>();
    },

    clearJudicialMutationMessages(state) {
      const masters = [state.courts, state.caseTypes];

      masters.forEach((master) => {
        master.createError = null;
        master.createSuccess = null;
        master.updateError = null;
        master.updateSuccess = null;
        master.deleteError = null;
        master.deleteSuccess = null;
      });
    },
  },

  extraReducers: (builder) => {
    // =================================================
    // COURTS - FETCH
    // =================================================

    builder
      .addCase(fetchCourts.pending, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.courts.options
            : state.courts.list;

        target.loading = true;
        target.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.courts.options
            : state.courts.list;

        target.loading = false;
        target.data = action.payload.data || [];
        target.totalCount = action.payload.totalCount || 0;
        target.pagination = action.payload.pagination || null;
        target.error = null;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.courts.options
            : state.courts.list;

        target.loading = false;
        target.error = getRejectedMessage(
          action.payload,
          "Failed to fetch courts",
        );
      });

    // =================================================
    // COURTS - CREATE
    // =================================================

    builder
      .addCase(createCourt.pending, (state) => {
        state.courts.createLoading = true;
        state.courts.createError = null;
        state.courts.createSuccess = null;
      })
      .addCase(createCourt.fulfilled, (state, action) => {
        state.courts.createLoading = false;
        state.courts.createSuccess = getResponseMessage(
          action.payload,
          "Court created successfully",
        );
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.courts.createLoading = false;
        state.courts.createError = getRejectedMessage(
          action.payload,
          "Failed to create court",
        );
      });

    // =================================================
    // COURTS - UPDATE
    // =================================================

    builder
      .addCase(updateCourt.pending, (state) => {
        state.courts.updateLoading = true;
        state.courts.updateError = null;
        state.courts.updateSuccess = null;
      })
      .addCase(updateCourt.fulfilled, (state, action) => {
        state.courts.updateLoading = false;
        state.courts.updateSuccess = getResponseMessage(
          action.payload,
          "Court updated successfully",
        );
      })
      .addCase(updateCourt.rejected, (state, action) => {
        state.courts.updateLoading = false;
        state.courts.updateError = getRejectedMessage(
          action.payload,
          "Failed to update court",
        );
      });

    // =================================================
    // COURTS - DELETE
    // =================================================

    builder
      .addCase(deleteCourt.pending, (state) => {
        state.courts.deleteLoading = true;
        state.courts.deleteError = null;
        state.courts.deleteSuccess = null;
      })
      .addCase(deleteCourt.fulfilled, (state, action) => {
        state.courts.deleteLoading = false;
        state.courts.deleteSuccess = getResponseMessage(
          action.payload,
          "Court deleted successfully",
        );
      })
      .addCase(deleteCourt.rejected, (state, action) => {
        state.courts.deleteLoading = false;
        state.courts.deleteError = getRejectedMessage(
          action.payload,
          "Cannot delete court",
        );
      });
    builder
      .addCase(fetchCaseTypes.pending, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.caseTypes.options
            : state.caseTypes.list;

        target.loading = true;
        target.error = null;
      })
      .addCase(fetchCaseTypes.fulfilled, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.caseTypes.options
            : state.caseTypes.list;

        target.loading = false;
        target.data = action.payload.data || [];
        target.totalCount = action.payload.totalCount || 0;
        target.pagination = action.payload.pagination || null;
        target.error = null;
      })
      .addCase(fetchCaseTypes.rejected, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.caseTypes.options
            : state.caseTypes.list;

        target.loading = false;
        target.error = getRejectedMessage(
          action.payload,
          "Failed to fetch case types",
        );
      });

    // =================================================
    // CASE TYPES - CREATE
    // =================================================

    builder
      .addCase(createCaseType.pending, (state) => {
        state.caseTypes.createLoading = true;
        state.caseTypes.createError = null;
        state.caseTypes.createSuccess = null;
      })
      .addCase(createCaseType.fulfilled, (state, action) => {
        state.caseTypes.createLoading = false;
        state.caseTypes.createSuccess = getResponseMessage(
          action.payload,
          "Case type created successfully",
        );
      })
      .addCase(createCaseType.rejected, (state, action) => {
        state.caseTypes.createLoading = false;
        state.caseTypes.createError = getRejectedMessage(
          action.payload,
          "Failed to create case type",
        );
      });

    // =================================================
    // CASE TYPES - UPDATE
    // =================================================

    builder
      .addCase(updateCaseType.pending, (state) => {
        state.caseTypes.updateLoading = true;
        state.caseTypes.updateError = null;
        state.caseTypes.updateSuccess = null;
      })
      .addCase(updateCaseType.fulfilled, (state, action) => {
        state.caseTypes.updateLoading = false;
        state.caseTypes.updateSuccess = getResponseMessage(
          action.payload,
          "Case type updated successfully",
        );
      })
      .addCase(updateCaseType.rejected, (state, action) => {
        state.caseTypes.updateLoading = false;
        state.caseTypes.updateError = getRejectedMessage(
          action.payload,
          "Failed to update case type",
        );
      });

    // =================================================
    // CASE TYPES - DELETE
    // =================================================

    builder
      .addCase(deleteCaseType.pending, (state) => {
        state.caseTypes.deleteLoading = true;
        state.caseTypes.deleteError = null;
      })
      .addCase(deleteCaseType.fulfilled, (state, action) => {
        state.caseTypes.deleteLoading = false;
        state.caseTypes.deleteSuccess = getResponseMessage(
          action.payload,
          "Case type deleted successfully",
        );
      })
      .addCase(deleteCaseType.rejected, (state, action) => {
        state.caseTypes.deleteLoading = false;
        state.caseTypes.deleteError = getRejectedMessage(
          action.payload,
          "Cannot delete case type",
        );
      });
  },
});

export const {
  clearJudicialCourts,
  clearCaseTypes,
  clearJudicialMutationMessages,
} = judicialCourtsSlice.actions;

export default judicialCourtsSlice.reducer;