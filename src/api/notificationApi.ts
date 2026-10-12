
import axiosClient from "./axiosClient";

export interface NotificationItem {
  _id: string;
  recipientId: string;
  caseId: string;
  fileNo: string;
  type: "FILE_FORWARDED" | "HEARING_REMINDER" | "STAY_ALERT" | "CONTEMPT_NOTICE";
  title: string;
  message: string;
  isUrgent: boolean;
  isRead: boolean;
  senderName: string;
  senderDesignation: string;
  createdAt: string;
}

export interface NotificationsListResponse {
  success: boolean;
  unreadCount: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: NotificationItem[];
}

export const NotificationAPI = {
  getUnreadCount: async (): Promise<{ success: boolean; unreadCount: number }> => {
    const res = await axiosClient.get("/notifications/unread-count");
    return res.data;
  },

  getUserNotifications: async (params?: { page?: number; limit?: number }): Promise<NotificationsListResponse> => {
    const res = await axiosClient.get("/notifications", { params });
    return res.data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean; data: NotificationItem }> => {
    const res = await axiosClient.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const res = await axiosClient.put("/notifications/read-all");
    return res.data;
  },
};