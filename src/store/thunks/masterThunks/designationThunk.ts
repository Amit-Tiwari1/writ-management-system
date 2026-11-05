import { createAsyncThunk } from "@reduxjs/toolkit";
import { MastersAPI } from "@/api/mastersApi";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

export const fetchDesignations = createAsyncThunk(
  "designations/fetchDesignations",
  async (
    params: Parameters<typeof MastersAPI.getDesignations>[0],
    { rejectWithValue },
  ) => {
    try {
      return await MastersAPI.getDesignations(params);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || getErrorMessage(error),
      );
    }
  },
);

export const createDesignation = createAsyncThunk(
  "designations/createDesignation",
  async (
    payload: Parameters<typeof MastersAPI.createDesignation>[0],
    { rejectWithValue },
  ) => {
    try {
      return await MastersAPI.createDesignation(payload);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || getErrorMessage(error),
      );
    }
  },
);

export const updateDesignation = createAsyncThunk(
  "designations/updateDesignation",
  async (
    args: {
      id: string;
      payload: Parameters<typeof MastersAPI.updateDesignation>[1];
    },
    { rejectWithValue },
  ) => {
    try {
      return await MastersAPI.updateDesignation(args.id, args.payload);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || getErrorMessage(error),
      );
    }
  },
);

export const deleteDesignation = createAsyncThunk(
  "designations/deleteDesignation",
  async (id: string, { rejectWithValue }) => {
    try {
      return await MastersAPI.deleteDesignation(id);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || getErrorMessage(error),
      );
    }
  },
);