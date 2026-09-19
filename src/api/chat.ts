import { apiFetch, toQuery } from "./client";
import type { Board, ChatMessage, ChatRoom } from "./types";

export type ChatRoomListItem = {
  id: string;
  otherUser: { id: string; nickname: string };
  board?: Board;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
};

export const chatApi = {
  createRoom(targetUserId: string, boardId: string) {
    return apiFetch<{ room: ChatRoom; isNew: boolean }>("/api/chat/rooms", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ targetUserId, boardId }),
    });
  },
  listRooms(page = 1, limit = 20) {
    return apiFetch<{ rooms: ChatRoomListItem[]; total: number; hasNext: boolean }>(
      `/api/chat/rooms${toQuery({ page, limit })}`,
      { auth: true },
    );
  },
  getMessages(roomId: string, cursor?: string, limit = 50) {
    return apiFetch<{ room: ChatRoom; messages: ChatMessage[]; nextCursor: string | null }>(
      `/api/chat/rooms/${roomId}/messages${toQuery({ cursor, limit })}`,
      { auth: true },
    );
  },
};
