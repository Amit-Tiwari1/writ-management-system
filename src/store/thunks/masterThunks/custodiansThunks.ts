
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MastersAPI } from "../../../api/mastersApi";


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

export const fetchSubjectCustodians = createApiThunk(
  "custodians/fetchSubjectCustodians",
  async (params: Parameters<typeof MastersAPI.getCustodians>[0]) => {
    console.log("🔵 THUNK PARAMS:", params);

    const response = await MastersAPI.getCustodians(params);

    console.log("🔵 THUNK RESPONSE:", response);
    console.log("🔵 THUNK DATA:", response?.data);
    console.log("🔵 THUNK DATA LENGTH:", response?.data?.length);

    return response;
  },
);
export const createCustodian = createApiThunk(
  "custodians/createCustodian",
  (payload: Parameters<typeof MastersAPI.createCustodian>[0]) =>
    MastersAPI.createCustodian(payload),
);

export const updateCustodian = createApiThunk(
  "custodians/updateCustodian",
  (args: {
    id: string;
    payload: Parameters<typeof MastersAPI.updateCustodian>[1];
  }) => MastersAPI.updateCustodian(args.id, args.payload),
);

export const deleteCustodian = createApiThunk(
  "custodians/deleteCustodian",
  (id: string) => MastersAPI.deleteCustodian(id),
);
