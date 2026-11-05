
import { createAsyncThunk } from "@reduxjs/toolkit";

import { MastersAPI } from "@/api/mastersApi";
import {
  AliasFormValues,
  StandingCounselFormValues,
} from "@/schemas/masterSchema";
import {
  IAliasItem,
  IStandingCounselItem,
  PaginatedResponse,
} from "@/types/master.types";
import { MasterListParams } from "@/api/mastersApi";

/**
 * Extract a useful error message from an API error.
 */
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
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
};

/* =========================================================
   ALIAS MASTER THUNKS
========================================================= */

/**
 * Fetch paginated alias records.
 */
export const fetchAliases = createAsyncThunk<
  PaginatedResponse<IAliasItem>,
  MasterListParams | undefined,
  { rejectValue: string }
>(
  "aliases/fetchAliases",
  async (params, { rejectWithValue }) => {
    try {
      return await MastersAPI.getAliases(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Create a new alias.
 */
export const createAlias = createAsyncThunk<
  IAliasItem,
  AliasFormValues,
  { rejectValue: string }
>(
  "aliases/createAlias",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await MastersAPI.createAlias(payload);

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.message || "Failed to create alias"
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Update an existing alias.
 */
export const updateAlias = createAsyncThunk<
  IAliasItem,
  { id: string; payload: Partial<AliasFormValues> },
  { rejectValue: string }
>(
  "aliases/updateAlias",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await MastersAPI.updateAlias(id, payload);

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.message || "Failed to update alias"
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Delete an alias.
 */
export const deleteAlias = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "aliases/deleteAlias",
  async (id, { rejectWithValue }) => {
    try {
      const response = await MastersAPI.deleteAlias(id);

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to delete alias"
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/* =========================================================
   STANDING COUNSEL MASTER THUNKS
========================================================= */

/**
 * Fetch paginated standing counsel records.
 */
export const fetchStandingCounsels = createAsyncThunk<
  PaginatedResponse<IStandingCounselItem>,
  MasterListParams | undefined,
  { rejectValue: string }
>(
  "aliases/fetchStandingCounsels",
  async (params, { rejectWithValue }) => {
    try {
      return await MastersAPI.getStandingCounsels(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Create a new standing counsel.
 */
export const createStandingCounsel = createAsyncThunk<
  IStandingCounselItem,
  StandingCounselFormValues,
  { rejectValue: string }
>(
  "aliases/createStandingCounsel",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await MastersAPI.createStandingCounsel(payload);

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.message || "Failed to create standing counsel"
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Update an existing standing counsel.
 */
export const updateStandingCounsel = createAsyncThunk<
  IStandingCounselItem,
  { id: string; payload: Partial<StandingCounselFormValues> },
  { rejectValue: string }
>(
  "aliases/updateStandingCounsel",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await MastersAPI.updateStandingCounsel(
        id,
        payload
      );

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.message || "Failed to update standing counsel"
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Delete a standing counsel.
 */
export const deleteStandingCounsel = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "aliases/deleteStandingCounsel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await MastersAPI.deleteStandingCounsel(id);

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to delete standing counsel"
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
