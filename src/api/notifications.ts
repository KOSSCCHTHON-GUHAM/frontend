import { apiFetch, toQuery } from "./client";
import type { AppNotification } from "./types";

export const notificationsApi = {
  list(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
    return apiFetch<{
      notifications: AppNotification[];
      unreadCount: number;
      hasNext: boolean;
    }>(`/api/notifications${toQuery(params)}`, { auth: true });
  },
  read(id: string) {
    return apiFetch<{ id: string; isRead: true }>(`/api/notifications/${id}/read`, {
      method: "PATCH",
      auth: true,
    });
  },
  readAll() {
    return apiFetch<{ updatedCount: number; unreadCount: 0 }>("/api/notifications", {
      method: "PATCH",
      auth: true,
    });
  },
};
