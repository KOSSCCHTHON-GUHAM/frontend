import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Socket } from "socket.io-client";

import { chatApi, usersApi } from "@/api";
import {
  createChatSocket,
  type ChatClientEvents,
  type ChatServerEvents,
} from "@/api/socket";
import type { ChatMessage } from "@/api/types";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Avatar({ size }: { size: number }) {
  return (
    <Image
      source={require("../../assets/avatar.png")}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      resizeMode="contain"
    />
  );
}

export default function ChatScreen() {
  const router = useRouter();

  const { roomId, partnerName, postTitle } = useLocalSearchParams<{
    roomId: string;
    partnerName?: string;
    postTitle?: string;
  }>();

  const scrollRef = useRef<ScrollView>(null);

  const socketRef = useRef<Socket<ChatServerEvents, ChatClientEvents> | null>(
    null,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [myUserId, setMyUserId] = useState("");

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      const exists = prev.some((item) => item.id === message.id);

      if (exists) {
        return prev;
      }

      return [...prev, message];
    });
  };

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    const connectChat = async () => {
      try {
        const [messageResponse, meResponse] = await Promise.all([
          chatApi.getMessages(roomId),
          usersApi.getMe(),
        ]);

        if (!mounted) return;

        setMessages(messageResponse.messages);
        setMyUserId(meResponse.user.id);

        const socket = await createChatSocket();

        if (!mounted) {
          socket.disconnect();
          return;
        }

        socketRef.current = socket;

        socket.on("message:new", ({ message }) => {
          if (message.roomId !== roomId) return;

          addMessage(message);
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error.message);
        });

        socket.connect();

        socket.emit("chat:join", { roomId }, (response) => {
          if (response.error) {
            Alert.alert("채팅 연결 실패", response.error);
          }
        });
      } catch (error) {
        Alert.alert(
          "채팅 조회 실패",
          error instanceof Error
            ? error.message
            : "채팅을 불러오지 못했습니다.",
        );
      }
    };

    connectChat();

    return () => {
      mounted = false;

      const socket = socketRef.current;

      if (socket) {
        socket.emit("chat:leave", { roomId });
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!roomId || !socket?.connected || messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    socket.emit("message:read", {
      roomId,
      lastReadMessageId: lastMessage.id,
    });
  }, [messages, roomId]);

  const send = () => {
    const content = input.trim();
    const socket = socketRef.current;

    if (!content || !roomId) {
      return;
    }

    if (!socket?.connected) {
      Alert.alert("전송 실패", "채팅 서버에 연결되어 있지 않습니다.");
      return;
    }

    const clientMessageId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    socket.emit(
      "message:send",
      {
        roomId,
        clientMessageId,
        content,
        messageType: "TEXT",
      },
      (response) => {
        if (response.error) {
          Alert.alert("전송 실패", response.error);
          return;
        }

        if (response.message) {
          addMessage(response.message);
        }

        setInput("");
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable
            hitSlop={8}
            onPress={() => router.canGoBack() && router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>

          <View style={styles.headerAvatar}>
            <Avatar size={40} />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{partnerName ?? "채팅"}</Text>

            {!!postTitle && (
              <Text style={styles.headerPost} numberOfLines={1}>
                {postTitle}
              </Text>
            )}
          </View>

          <Pressable hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#111111" />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => {
            const isMine = message.senderId === myUserId;

            if (isMine) {
              return (
                <View key={message.id} style={styles.meRow}>
                  <View style={[styles.bubble, styles.meBubble]}>
                    <Text style={styles.meText}>{message.content}</Text>
                  </View>

                  <Text style={styles.time}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              );
            }

            return (
              <View key={message.id} style={styles.otherRow}>
                <Avatar size={24} />

                <View style={styles.otherBody}>
                  <View style={[styles.bubble, styles.otherBubble]}>
                    <Text style={styles.otherText}>{message.content}</Text>
                  </View>

                  <Text style={styles.time}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputBar}>
          <Pressable style={styles.aiButton}>
            <Ionicons name="sparkles" size={16} color="#666666" />
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="메시지를 입력해주세요"
            placeholderTextColor="#AAAAAA"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />

          <Pressable
            style={[styles.sendButton, !input.trim() && styles.sendDisabled]}
            onPress={send}
            disabled={!input.trim()}
          >
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: "#F5F5F5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerAvatar: {
    marginLeft: 8,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  headerName: {
    fontSize: 15,
    fontWeight: "bold",
  },

  headerPost: {
    fontSize: 11,
    color: "#888888",
    marginTop: 2,
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  time: {
    fontSize: 10,
    color: "#AAAAAA",
    marginTop: 4,
  },

  otherRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  otherBody: {
    marginLeft: 8,
    flexShrink: 1,
    maxWidth: "78%",
  },

  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
  },

  otherText: {
    fontSize: 13,
    color: "#222222",
    lineHeight: 19,
  },

  meRow: {
    alignItems: "flex-end",
    marginBottom: 14,
  },

  meBubble: {
    backgroundColor: "#1A1A1A",
    borderBottomRightRadius: 4,
    maxWidth: "78%",
  },

  meText: {
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 19,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  aiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    fontSize: 13,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },

  sendDisabled: {
    opacity: 0.4,
  },
});
