
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MastersAPI } from "@/api/mastersApi";

// =====================================================
// ERROR HANDLER
// =====================================================

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

// =====================================================
// COMMON API THUNK
// =====================================================

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

// =====================================================
// 1. FETCH DEPARTMENTS
// Supports: list | options, search, filters, pagination
// =====================================================

export const fetchDepartments = createApiThunk(
  "organization/fetchDepartments",
  (params: Parameters<typeof MastersAPI.getDepartments>[0]) =>
    MastersAPI.getDepartments(params),
);

// =====================================================
// 2. CREATE DEPARTMENT
// =====================================================

export const createDepartment = createApiThunk(
  "organization/createDepartment",
  (payload: Parameters<typeof MastersAPI.createDepartment>[0]) =>
    MastersAPI.createDepartment(payload),
);

// =====================================================
// 3. UPDATE DEPARTMENT
// =====================================================

export const updateDepartment = createApiThunk(
  "organization/updateDepartment",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateDepartment>[1];
  }) => MastersAPI.updateDepartment(args.id, args.payload),
);

// =====================================================
// 4. DELETE DEPARTMENT
// =====================================================

export const deleteDepartment = createApiThunk(
  "organization/deleteDepartment",
  (id: string) => MastersAPI.deleteDepartment(id),
);
