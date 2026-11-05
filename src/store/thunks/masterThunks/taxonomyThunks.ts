
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MastersAPI } from "@/api/mastersApi";

const getErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    err.response?.data?.message ||
    err.message ||
    "Something went wrong. Please try again."
  );
};

const createApiThunk = <TArg, TResult>(
  typePrefix: string,
  apiCall: (arg: TArg) => Promise<TResult>,
) =>
  createAsyncThunk<TResult, TArg, { rejectValue: string }>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        return await apiCall(arg);
      } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
      }
    },
  );

// ======================================================
// CATEGORIES
// ======================================================

export const fetchCategories = createApiThunk(
  "taxonomy/fetchCategories",
  (params: Parameters<typeof MastersAPI.getCategories>[0]) =>
    MastersAPI.getCategories(params),
);

export const createCategory = createApiThunk(
  "taxonomy/createCategory",
  (payload: Parameters<typeof MastersAPI.createCategory>[0]) =>
    MastersAPI.createCategory(payload),
);

export const updateCategory = createApiThunk(
  "taxonomy/updateCategory",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateCategory>[1];
  }) => MastersAPI.updateCategory(args.id, args.payload),
);

export const deleteCategory = createApiThunk(
  "taxonomy/deleteCategory",
  (id: string) => MastersAPI.deleteCategory(id),
);

// ======================================================
// SUB-CATEGORIES
// ======================================================

export const fetchSubCategories = createApiThunk(
  "taxonomy/fetchSubCategories",
  (params: Parameters<typeof MastersAPI.getSubCategories>[0]) =>
    MastersAPI.getSubCategories(params),
);

export const createSubCategory = createApiThunk(
  "taxonomy/createSubCategory",
  (payload: Parameters<typeof MastersAPI.createSubCategory>[0]) =>
    MastersAPI.createSubCategory(payload),
);

export const updateSubCategory = createApiThunk(
  "taxonomy/updateSubCategory",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateSubCategory>[1];
  }) => MastersAPI.updateSubCategory(args.id, args.payload),
);

export const deleteSubCategory = createApiThunk(
  "taxonomy/deleteSubCategory",
  (id: string) => MastersAPI.deleteSubCategory(id),
);

// ======================================================
// SUBJECTS
// ======================================================

export const fetchSubjects = createApiThunk(
  "taxonomy/fetchSubjects",
  (params: Parameters<typeof MastersAPI.getSubjects>[0]) =>
    MastersAPI.getSubjects(params),
);

export const createSubject = createApiThunk(
  "taxonomy/createSubject",
  (payload: Parameters<typeof MastersAPI.createSubject>[0]) =>
    MastersAPI.createSubject(payload),
);

export const updateSubject = createApiThunk(
  "taxonomy/updateSubject",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateSubject>[1];
  }) => MastersAPI.updateSubject(args.id, args.payload),
);

export const deleteSubject = createApiThunk(
  "taxonomy/deleteSubject",
  (id: string) => MastersAPI.deleteSubject(id),
);
