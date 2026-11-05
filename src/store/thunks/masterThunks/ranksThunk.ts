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

// FETCH RANKS
export const fetchRanks = createApiThunk(
  "ranks/fetchRanks",
  (params: Parameters<typeof MastersAPI.getRanks>[0]) =>
    MastersAPI.getRanks(params),
);

// CREATE RANK
export const createRank = createApiThunk(
  "ranks/createRank",
  (payload: Parameters<typeof MastersAPI.createRank>[0]) =>
    MastersAPI.createRank(payload),
);

// UPDATE RANK
export const updateRank = createApiThunk(
  "ranks/updateRank",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateRank>[1];
  }) => MastersAPI.updateRank(args.id, args.payload),
);

// DELETE RANK
export const deleteRank = createApiThunk(
  "ranks/deleteRank",
  (id: string) => MastersAPI.deleteRank(id),
);