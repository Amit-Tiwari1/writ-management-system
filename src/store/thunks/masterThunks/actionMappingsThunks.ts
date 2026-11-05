import { createAsyncThunk } from "@reduxjs/toolkit";
import { MastersAPI } from "@/api/mastersApi";

import type {
  MasterListParams,
  MasterMutationResponse,
  MasterDeleteResponse,
} from "@/api/mastersApi";

import type {
  IActionMappingItem,
  PaginatedResponse,
} from "@/types/master.types";

import type {
  ActionMappingFormValues,
} from "@/schemas/masterSchema";

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

// Fetch Action Mapping Rules
export const fetchActionMappings = createAsyncThunk<
  PaginatedResponse<IActionMappingItem>,
  MasterListParams | undefined,
  { rejectValue: string }
>(
  "actionMappings/fetchActionMappings",
  async (params, { rejectWithValue }) => {
    try {
      return await MastersAPI.getActionMappings(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create Action Mapping Rule
export const createActionMapping = createAsyncThunk<
  MasterMutationResponse<IActionMappingItem>,
  ActionMappingFormValues,
  { rejectValue: string }
>(
  "actionMappings/createActionMapping",
  async (payload, { rejectWithValue }) => {
    try {
      return await MastersAPI.createActionMapping(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update Action Mapping Rule
export const updateActionMapping = createAsyncThunk<
  MasterMutationResponse<IActionMappingItem>,
  {
    id: string;
    payload: Partial<ActionMappingFormValues>;
  },
  { rejectValue: string }
>(
  "actionMappings/updateActionMapping",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await MastersAPI.updateActionMapping(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete Action Mapping Rule
export const deleteActionMapping = createAsyncThunk<
  MasterDeleteResponse,
  string,
  { rejectValue: string }
>(
  "actionMappings/deleteActionMapping",
  async (id, { rejectWithValue }) => {
    try {
      return await MastersAPI.deleteActionMapping(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);