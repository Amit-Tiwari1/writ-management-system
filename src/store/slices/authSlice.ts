import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";
import Cookies from "js-cookie";
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
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // App initial mount verify hone tak loading true rahegi
  error: null,
};

// 1. Thunk: User Login
export const loginThunk = createAsyncThunk(
  "auth/loginThunk",
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/login", credentials);
      const { token, user } = response.data;

      // Save token in cookie and localStorage
      Cookies.set("access_token", token, { expires: 7, sameSite: "lax" });
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", token);
      }

      return { token, user };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials.";
      return rejectWithValue(msg);
    }
  }
);

// 2. Thunk: Hydrate Current Logged In User (/auth/me)
export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMeThunk",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("access_token") || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await axiosClient.get("/auth/me");
      return { token, user: response.data.user };
    } catch (err: any) {
      Cookies.remove("access_token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutAction: (state) => {
      Cookies.remove("access_token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ token: string; user: UserProfile }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });

    // Fetch Me
    builder.addCase(fetchMeThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMeThunk.fulfilled, (state, action: PayloadAction<{ token: string; user: UserProfile }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(fetchMeThunk.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });
  },
});

export const { logoutAction, clearAuthError } = authSlice.actions;
export default authSlice.reducer;