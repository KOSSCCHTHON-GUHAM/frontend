import { sessionStore } from "@/auth/session";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage, MessageType } from "./types";

export type ChatServerEvents = {
  "chat:joined": (payload: { roomId: string }) => void;
  "message:new": (payload: { message: ChatMessage }) => void;
  "message:read": (payload: {
    roomId: string;
    userId: string;
    lastReadMessageId: string;
  }) => void;
};

export type ChatClientEvents = {
  "chat:join": (
    payload: { roomId: string },
    ack?: (response: { roomId?: string; error?: string }) => void,
  ) => void;

  "message:send": (
    payload: {
      roomId: string;
      clientMessageId: string;
      content: string;
      messageType: MessageType;
    },
    ack?: (response: {
      message?: ChatMessage;
      duplicated?: boolean;
      error?: string;
    }) => void,
  ) => void;

  "message:read": (
    payload: { roomId: string; lastReadMessageId: string },
    ack?: (response: { roomId?: string; error?: string }) => void,
  ) => void;

  "chat:leave": (
    payload: { roomId: string },
    ack?: (response: { roomId?: string }) => void,
  ) => void;
};

export async function createChatSocket(): Promise<
  Socket<ChatServerEvents, ChatClientEvents>
> {
  const accessToken = await sessionStore.getAccessToken();

  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  return io('http://172.20.10.2:3000', {
    path: "/chat",
    transports: ["websocket"],
    auth: { accessToken },
    autoConnect: false,
  });
}
