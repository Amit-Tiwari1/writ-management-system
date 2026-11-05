
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
// 1. STATES
// =====================================================

export const fetchStates = createApiThunk(
  "location/fetchStates",
  (params: Parameters<typeof MastersAPI.getStates>[0]) =>
    MastersAPI.getStates(params),
);

export const createState = createApiThunk(
  "location/createState",
  (payload: Parameters<typeof MastersAPI.createState>[0]) =>
    MastersAPI.createState(payload),
);

export const updateState = createApiThunk(
  "location/updateState",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateState>[1];
  }) => MastersAPI.updateState(args.id, args.payload),
);

export const deleteState = createApiThunk(
  "location/deleteState",
  (id: string) => MastersAPI.deleteState(id),
);

// =====================================================
// 2. ZONES
// =====================================================

export const fetchZones = createApiThunk(
  "location/fetchZones",
  (params: Parameters<typeof MastersAPI.getZones>[0]) =>
    MastersAPI.getZones(params),
);

export const createZone = createApiThunk(
  "location/createZone",
  (payload: Parameters<typeof MastersAPI.createZone>[0]) =>
    MastersAPI.createZone(payload),
);

export const updateZone = createApiThunk(
  "location/updateZone",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateZone>[1];
  }) => MastersAPI.updateZone(args.id, args.payload),
);

export const deleteZone = createApiThunk(
  "location/deleteZone",
  (id: string) => MastersAPI.deleteZone(id),
);

// =====================================================
// 3. RANGES
// =====================================================

export const fetchRanges = createApiThunk(
  "location/fetchRanges",
  (params: Parameters<typeof MastersAPI.getRanges>[0]) =>
    MastersAPI.getRanges(params),
);

export const createRange = createApiThunk(
  "location/createRange",
  (payload: Parameters<typeof MastersAPI.createRange>[0]) =>
    MastersAPI.createRange(payload),
);

export const updateRange = createApiThunk(
  "location/updateRange",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateRange>[1];
  }) => MastersAPI.updateRange(args.id, args.payload),
);

export const deleteRange = createApiThunk(
  "location/deleteRange",
  (id: string) => MastersAPI.deleteRange(id),
);

// =====================================================
// 4. DISTRICTS
// =====================================================

export const fetchDistricts = createApiThunk(
  "location/fetchDistricts",
  (params: Parameters<typeof MastersAPI.getDistricts>[0]) =>
    MastersAPI.getDistricts(params),
);

export const createDistrict = createApiThunk(
  "location/createDistrict",
  (payload: Parameters<typeof MastersAPI.createDistrict>[0]) =>
    MastersAPI.createDistrict(payload),
);

export const updateDistrict = createApiThunk(
  "location/updateDistrict",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateDistrict>[1];
  }) => MastersAPI.updateDistrict(args.id, args.payload),
);

export const deleteDistrict = createApiThunk(
  "location/deleteDistrict",
  (id: string) => MastersAPI.deleteDistrict(id),
);
