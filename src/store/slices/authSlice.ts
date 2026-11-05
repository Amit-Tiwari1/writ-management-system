
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";
import { LoginFormData } from "../../schemas/authSchema";

export interface UserPermission {
  menuKey: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSign: boolean;
  canExport: boolean;
  canDownload: boolean;
}

export interface MenuItem {
  _id: string;
  groupKey: string;
  groupTitle: string;
  key: string;
  label: string;
  path: string;
  icon: string;
  order: number;
  subMenus?: {
    key: string;
    label: string;
    path: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
    order: number;
  }[];
  actions?: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSign: boolean;
    canExport: boolean;
    canDownload: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  rank?: string;
  designation: string;
  section: string;
  mobile: string;
  email: string;
  role: string;
  roleId?: string;
  courtBench?: string;
  status: string;
  permissions: UserPermission[];
  allowedMenus: MenuItem[];
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecoveryLoading: boolean;
  recoveryMaskedEmail: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isRecoveryLoading: false,
  recoveryMaskedEmail: null,
  error: null,
};

// Helper: Get access token from localStorage
const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
};

// Helper: Clear frontend authentication data
const clearStoredToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

// LOGIN

export const loginThunk = createAsyncThunk(
  "auth/loginThunk",
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      // Step 1: Authenticate user
      const response = await axiosClient.post(
        "/auth/login",
        credentials
      );

      const token = response.data?.token;

      if (!token) {
        return rejectWithValue(
          "Invalid login response from server."
        );
      }

      // Step 2: Store access token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", token);
      }

      // Step 3: Fetch complete hydrated user profile
      const profileResponse = await axiosClient.get("/auth/me");

      const user = profileResponse.data?.user;

      if (!user) {
        clearStoredToken();

        return rejectWithValue(
          "Unable to load user profile."
        );
      }

      // Step 4: Return complete profile to Redux
      return {
        token: getStoredToken() || token,
        user,
      };

    } catch (err: any) {
  clearStoredToken();

  const msg =
    err.response?.data?.message ||
    err.message ||
    "Invalid credentials.";

  return rejectWithValue(msg);
}
  }
);


// FETCH CURRENT USER / RESTORE SESSION
export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMeThunk",
  async (_, { rejectWithValue }) => {
    try {
      // Do not check for a local token before calling /me.
      // The backend access cookie or refresh interceptor can restore the session.
      const response = await axiosClient.get("/auth/me");

      const user = response.data.user;
      const token = getStoredToken();

      if (!user) {
        clearStoredToken();
        return rejectWithValue("User profile not found.");
      }

      return {
        token,
        user,
      };
    }  catch (err: any) {
  const status = err.response?.status;

  if (status === 401 || status === 403) {
    clearStoredToken();
  }

  const msg =
    err.response?.data?.message ||
    err.message ||
    "Session expired. Please login again.";

  return rejectWithValue(msg);
}
  }
);

// LOGOUT
export const logoutThunk = createAsyncThunk(
  "auth/logoutThunk",
  async () => {
    let serverLogoutSucceeded = false;

    try {
      await axiosClient.post("/auth/logout");
      serverLogoutSucceeded = true;
    } catch (error) {
      console.error("Logout API Error:", error);
    } finally {
      clearStoredToken();
    }

    return { serverLogoutSucceeded };
  }
);

// FORGOT PASSWORD
export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPasswordThunk",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/forgot-password", {
        identifier,
      });

      return response.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to dispatch verification code.";

      return rejectWithValue(msg);
    }
  }
);

// RESET PASSWORD
export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPasswordThunk",
  async (
    payload: {
      identifier: string;
      otp: string;
      newPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.post(
        "/auth/reset-password",
        payload
      );

      return response.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Password update verification failed.";

      return rejectWithValue(msg);
    }
  }
);

// AUTH SLICE
export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
   
    logoutAction: (state) => {
      clearStoredToken();

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    clearRecoveryState: (state) => {
      state.isRecoveryLoading = false;
      state.recoveryMaskedEmail = null;
    },
  },

 
extraReducers: (builder) => {
  // LOGIN
  builder.addCase(loginThunk.pending, (state) => {
    state.isLoading = true;
    state.error = null;
  });

  builder.addCase(
    loginThunk.fulfilled,
    (
      state,
      action: PayloadAction<{
        token: string;
        user: UserProfile;
      }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    }
  );

  builder.addCase(loginThunk.rejected, (state, action) => {
    state.isLoading = false;
    state.isAuthenticated = false;
    state.token = null;
    state.user = null;
    state.error =
      (action.payload as string) || "Login failed.";
  });

  builder.addCase(fetchMeThunk.pending, (state) => {
    state.isLoading = true;
    state.error = null;
  });

  builder.addCase(
    fetchMeThunk.fulfilled,
    (
      state,
      action: PayloadAction<{
        token: string | null;
        user: UserProfile;
      }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    }
  );

  builder.addCase(fetchMeThunk.rejected, (state, action) => {
    state.isLoading = false;
    state.isAuthenticated = false;
    state.user = null;
    state.token = null;
    state.error = action.payload as string || null;
  });

  // LOGOUT
  builder.addCase(logoutThunk.pending, (state) => {
    state.isLoading = true;
    state.error = null;
  });

  builder.addCase(logoutThunk.fulfilled, (state) => {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
    state.isLoading = false;
    state.error = null;
  });

  builder.addCase(logoutThunk.rejected, (state) => {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
    state.isLoading = false;
  });

  // FORGOT PASSWORD
  builder.addCase(forgotPasswordThunk.pending, (state) => {
    state.isRecoveryLoading = true;
    state.error = null;
  });

  builder.addCase(forgotPasswordThunk.fulfilled, (state, action) => {
    state.isRecoveryLoading = false;
    state.recoveryMaskedEmail = action.payload.maskedEmail || null;
    state.error = null;
  });

  builder.addCase(forgotPasswordThunk.rejected, (state, action) => {
    state.isRecoveryLoading = false;
    state.error =
      (action.payload as string) || "Failed to dispatch verification code.";
  });

  // RESET PASSWORD
  builder.addCase(resetPasswordThunk.pending, (state) => {
    state.isRecoveryLoading = true;
    state.error = null;
  });

  builder.addCase(resetPasswordThunk.fulfilled, (state) => {
    state.isRecoveryLoading = false;
    state.recoveryMaskedEmail = null;
    state.error = null;
  });

  builder.addCase(resetPasswordThunk.rejected, (state, action) => {
    state.isRecoveryLoading = false;
    state.error =
      (action.payload as string) || "Password reset failed.";
  });
},

});

export const {
  logoutAction,
  clearAuthError,
  clearRecoveryState,
} = authSlice.actions;

export default authSlice.reducer;
