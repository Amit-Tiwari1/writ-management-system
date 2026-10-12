import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  NotificationAPI,
  NotificationItem,
} from "@/api/notificationApi";

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await NotificationAPI.getUnreadCount();
      return res.unreadCount;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch count");
    }
  }
);

export const fetchNotificationsList = createAsyncThunk(
  "notifications/fetchList",
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await NotificationAPI.getUserNotifications(params);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch list");
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await NotificationAPI.markAsRead(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await NotificationAPI.markAllAsRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark all read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    });

    builder.addCase(fetchNotificationsList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotificationsList.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.data;
      state.unreadCount = action.payload.unreadCount;
      state.totalCount = action.payload.totalCount;
    });
    builder.addCase(fetchNotificationsList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<string>) => {
      const target = state.items.find((n) => n._id === action.payload);
      if (target && !target.isRead) {
        target.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.unreadCount = 0;
      state.items.forEach((n) => {
        n.isRead = true;
      });
    });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;