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

// =====================================================
// COURTS
// =====================================================

export const fetchCourts = createApiThunk(
  "judicialCourts/fetchCourts",
  (params: Parameters<typeof MastersAPI.getCourts>[0]) =>
    MastersAPI.getCourts(params),
);

export const createCourt = createApiThunk(
  "judicialCourts/createCourt",
  (payload: Parameters<typeof MastersAPI.createCourt>[0]) =>
    MastersAPI.createCourt(payload),
);

export const updateCourt = createApiThunk(
  "judicialCourts/updateCourt",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateCourt>[1];
  }) => MastersAPI.updateCourt(args.id, args.payload),
);

export const deleteCourt = createApiThunk(
  "judicialCourts/deleteCourt",
  (id: string) => MastersAPI.deleteCourt(id),
);

// =====================================================
// CASE TYPES
// =====================================================

export const fetchCaseTypes = createApiThunk(
  "judicialCourts/fetchCaseTypes",
  (params: Parameters<typeof MastersAPI.getCaseTypes>[0]) =>
    MastersAPI.getCaseTypes(params),
);

export const createCaseType = createApiThunk(
  "judicialCourts/createCaseType",
  (payload: Parameters<typeof MastersAPI.createCaseType>[0]) =>
    MastersAPI.createCaseType(payload),
);

export const updateCaseType = createApiThunk(
  "judicialCourts/updateCaseType",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateCaseType>[1];
  }) => MastersAPI.updateCaseType(args.id, args.payload),
);

export const deleteCaseType = createApiThunk(
  "judicialCourts/deleteCaseType",
  (id: string) => MastersAPI.deleteCaseType(id),
);