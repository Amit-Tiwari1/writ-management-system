
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MastersAPI } from "@/api/mastersApi";
import type {
  MasterListParams,
  MasterMutationResponse,
  MasterDeleteResponse,
} from "@/api/mastersApi";
import type { IRespondentGroupItem } from "@/types/master.types";
import type { RespondentGroupFormValues } from "@/schemas/masterSchema";
import type { PaginatedResponse } from "@/types/master.types";

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

export const fetchRespondentGroups = createAsyncThunk<
  PaginatedResponse<IRespondentGroupItem>,
  MasterListParams | undefined,
  { rejectValue: string }
>(
  "respondents/fetchRespondentGroups",
  async (params, { rejectWithValue }) => {
    try {
      return await MastersAPI.getRespondentGroups(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createRespondentGroup = createAsyncThunk<
  MasterMutationResponse<IRespondentGroupItem>,
  RespondentGroupFormValues,
  { rejectValue: string }
>(
  "respondents/createRespondentGroup",
  async (payload, { rejectWithValue }) => {
    try {
      return await MastersAPI.createRespondentGroup(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateRespondentGroup = createAsyncThunk<
  MasterMutationResponse<IRespondentGroupItem>,
  {
    id: string;
    payload: Partial<RespondentGroupFormValues>;
  },
  { rejectValue: string }
>(
  "respondents/updateRespondentGroup",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await MastersAPI.updateRespondentGroup(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteRespondentGroup = createAsyncThunk<
  MasterDeleteResponse,
  string,
  { rejectValue: string }
>(
  "respondents/deleteRespondentGroup",
  async (id, { rejectWithValue }) => {
    try {
      return await MastersAPI.deleteRespondentGroup(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
