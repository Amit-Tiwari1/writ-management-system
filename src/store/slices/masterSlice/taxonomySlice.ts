
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/store/thunks/masterThunks/taxonomyThunks";

import {
  ICategoryItem,
  ISubCategoryItem,
  ISubjectItem,
  PaginatedResponse,
} from "@/types/master.types";

// ======================================================
// TYPES
// ======================================================

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

interface TaxonomyMasterState<T> extends MutationState {
  list: MasterData<T>;
  options: MasterData<T>;
}

interface TaxonomyState {
  categories: TaxonomyMasterState<ICategoryItem>;
  subCategories: TaxonomyMasterState<ISubCategoryItem>;
  subjects: TaxonomyMasterState<ISubjectItem>;
}

// ======================================================
// INITIAL STATES
// ======================================================

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

const initialMasterState = <T>(): TaxonomyMasterState<T> => ({
  list: initialData<T>(),
  options: initialData<T>(),
  ...initialMutationState,
});

const initialState: TaxonomyState = {
  categories: initialMasterState<ICategoryItem>(),
  subCategories: initialMasterState<ISubCategoryItem>(),
  subjects: initialMasterState<ISubjectItem>(),
};

// ======================================================
// HELPERS
// ======================================================

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

// ======================================================
// SLICE
// ======================================================

const taxonomySlice = createSlice({
  name: "taxonomy",
  initialState,

  reducers: {
    clearCategories(state) {
      state.categories.list = initialData<ICategoryItem>();
      state.categories.options = initialData<ICategoryItem>();
    },

    clearSubCategories(state) {
      state.subCategories.list = initialData<ISubCategoryItem>();
      state.subCategories.options = initialData<ISubCategoryItem>();
    },

    clearSubjects(state) {
      state.subjects.list = initialData<ISubjectItem>();
      state.subjects.options = initialData<ISubjectItem>();
    },

    clearTaxonomyMutationMessages(state) {
      const masters = [
        state.categories,
        state.subCategories,
        state.subjects,
      ];

      masters.forEach((master) => {
        master.createError = null;
        master.createSuccess = null;
        master.updateError = null;
        master.updateSuccess = null;
        master.deleteError = null;
        master.deleteSuccess = null;
      });
    },

    clearTaxonomyData(state) {
      state.categories = initialMasterState<ICategoryItem>();
      state.subCategories = initialMasterState<ISubCategoryItem>();
      state.subjects = initialMasterState<ISubjectItem>();
    },
  },

  extraReducers: (builder) => {
    // ==================================================
    // CATEGORIES - FETCH
    // ==================================================

    builder
      .addCase(fetchCategories.pending, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.categories.options
            : state.categories.list;

        target.loading = true;
        target.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.categories.options
            : state.categories.list;

        target.loading = false;
        target.data = action.payload.data || [];
        target.totalCount = action.payload.totalCount || 0;
        target.pagination = action.payload.pagination || null;
        target.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.categories.options
            : state.categories.list;

        target.loading = false;
        target.error = getRejectedMessage(
          action.payload,
          "Failed to fetch categories",
        );
      });

    // ==================================================
    // CATEGORIES - CREATE
    // ==================================================

    builder
      .addCase(createCategory.pending, (state) => {
        state.categories.createLoading = true;
        state.categories.createError = null;
        state.categories.createSuccess = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.createLoading = false;
        state.categories.createSuccess = getResponseMessage(
          action.payload,
          "Category created successfully",
        );
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.categories.createLoading = false;
        state.categories.createError = getRejectedMessage(
          action.payload,
          "Failed to create category",
        );
      });

    // ==================================================
    // CATEGORIES - UPDATE
    // ==================================================

    builder
      .addCase(updateCategory.pending, (state) => {
        state.categories.updateLoading = true;
        state.categories.updateError = null;
        state.categories.updateSuccess = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories.updateLoading = false;
        state.categories.updateSuccess = getResponseMessage(
          action.payload,
          "Category updated successfully",
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.categories.updateLoading = false;
        state.categories.updateError = getRejectedMessage(
          action.payload,
          "Failed to update category",
        );
      });

    // ==================================================
    // CATEGORIES - DELETE
    // ==================================================

    builder
      .addCase(deleteCategory.pending, (state) => {
        state.categories.deleteLoading = true;
        state.categories.deleteError = null;
        state.categories.deleteSuccess = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories.deleteLoading = false;
        state.categories.deleteSuccess = getResponseMessage(
          action.payload,
          "Category deleted successfully",
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.categories.deleteLoading = false;
        state.categories.deleteError = getRejectedMessage(
          action.payload,
          "Cannot delete category",
        );
      });

    // ==================================================
    // SUB-CATEGORIES - FETCH
    // ==================================================

    builder
      .addCase(fetchSubCategories.pending, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.subCategories.options
            : state.subCategories.list;

        target.loading = true;
        target.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.subCategories.options
            : state.subCategories.list;

        target.loading = false;
        target.data = action.payload.data || [];
        target.totalCount = action.payload.totalCount || 0;
        target.pagination = action.payload.pagination || null;
        target.error = null;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.subCategories.options
            : state.subCategories.list;

        target.loading = false;
        target.error = getRejectedMessage(
          action.payload,
          "Failed to fetch sub-categories",
        );
      });

    // ==================================================
    // SUB-CATEGORIES - CREATE
    // ==================================================

    builder
      .addCase(createSubCategory.pending, (state) => {
        state.subCategories.createLoading = true;
        state.subCategories.createError = null;
        state.subCategories.createSuccess = null;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.subCategories.createLoading = false;
        state.subCategories.createSuccess = getResponseMessage(
          action.payload,
          "Sub-category created successfully",
        );
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.subCategories.createLoading = false;
        state.subCategories.createError = getRejectedMessage(
          action.payload,
          "Failed to create sub-category",
        );
      });

    // ==================================================
    // SUB-CATEGORIES - UPDATE
    // ==================================================

    builder
      .addCase(updateSubCategory.pending, (state) => {
        state.subCategories.updateLoading = true;
        state.subCategories.updateError = null;
        state.subCategories.updateSuccess = null;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.subCategories.updateLoading = false;
        state.subCategories.updateSuccess = getResponseMessage(
          action.payload,
          "Sub-category updated successfully",
        );
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.subCategories.updateLoading = false;
        state.subCategories.updateError = getRejectedMessage(
          action.payload,
          "Failed to update sub-category",
        );
      });

    // ==================================================
    // SUB-CATEGORIES - DELETE
    // ==================================================

    builder
      .addCase(deleteSubCategory.pending, (state) => {
        state.subCategories.deleteLoading = true;
        state.subCategories.deleteError = null;
        state.subCategories.deleteSuccess = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.subCategories.deleteLoading = false;
        state.subCategories.deleteSuccess = getResponseMessage(
          action.payload,
          "Sub-category deleted successfully",
        );
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.subCategories.deleteLoading = false;
        state.subCategories.deleteError = getRejectedMessage(
          action.payload,
          "Cannot delete sub-category",
        );
      });

    // ==================================================
    // SUBJECTS - FETCH
    // ==================================================

    builder
      .addCase(fetchSubjects.pending, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.subjects.options
            : state.subjects.list;

        target.loading = true;
        target.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.subjects.options
            : state.subjects.list;

        target.loading = false;
        target.data = action.payload.data || [];
        target.totalCount = action.payload.totalCount || 0;
        target.pagination = action.payload.pagination || null;
        target.error = null;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        const target =
          action.meta.arg?.view === "options"
            ? state.subjects.options
            : state.subjects.list;

        target.loading = false;
        target.error = getRejectedMessage(
          action.payload,
          "Failed to fetch subjects",
        );
      });

    // ==================================================
    // SUBJECTS - CREATE
    // ==================================================

    builder
      .addCase(createSubject.pending, (state) => {
        state.subjects.createLoading = true;
        state.subjects.createError = null;
        state.subjects.createSuccess = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.subjects.createLoading = false;
        state.subjects.createSuccess = getResponseMessage(
          action.payload,
          "Subject created successfully",
        );
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.subjects.createLoading = false;
        state.subjects.createError = getRejectedMessage(
          action.payload,
          "Failed to create subject",
        );
      });

    // ==================================================
    // SUBJECTS - UPDATE
    // ==================================================

    builder
      .addCase(updateSubject.pending, (state) => {
        state.subjects.updateLoading = true;
        state.subjects.updateError = null;
        state.subjects.updateSuccess = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.subjects.updateLoading = false;
        state.subjects.updateSuccess = getResponseMessage(
          action.payload,
          "Subject updated successfully",
        );
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.subjects.updateLoading = false;
        state.subjects.updateError = getRejectedMessage(
          action.payload,
          "Failed to update subject",
        );
      });

    // ==================================================
    // SUBJECTS - DELETE
    // ==================================================

    builder
      .addCase(deleteSubject.pending, (state) => {
        state.subjects.deleteLoading = true;
        state.subjects.deleteError = null;
        state.subjects.deleteSuccess = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects.deleteLoading = false;
        state.subjects.deleteSuccess = getResponseMessage(
          action.payload,
          "Subject deleted successfully",
        );
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.subjects.deleteLoading = false;
        state.subjects.deleteError = getRejectedMessage(
          action.payload,
          "Cannot delete subject",
        );
      });
  },
});

// ======================================================
// EXPORT ACTIONS
// ======================================================

export const {
  clearCategories,
  clearSubCategories,
  clearSubjects,
  clearTaxonomyMutationMessages,
  clearTaxonomyData,
} = taxonomySlice.actions;

export default taxonomySlice.reducer;
