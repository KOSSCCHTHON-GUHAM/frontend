import { chatApi, usersApi, type ChatMessage } from "@/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

const timeLabel = (date: string) =>
  new Date(date).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });

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
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState("");
  const [partnerName, setPartnerName] = useState("사용자");
  const [boardTitle, setBoardTitle] = useState("포스팅");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      Alert.alert("채팅 오류", "채팅방 식별자가 없습니다.");
      router.replace("/chat-list");
      return;
    }

    let active = true;

    const loadChat = async () => {
      try {
        setLoading(true);

        const history = await chatApi.getMessages(roomId);
        const roomList = await chatApi.listRooms(1, 100);
        const me = await usersApi.getMe();

        if (!active) return;

        const roomItem = roomList.rooms.find((room) => room.id === roomId);

        setMessages(history.messages);
        setMyId(me.user.id);
        setPartnerName(roomItem?.otherUser.nickname ?? "사용자");
        setBoardTitle(roomItem?.board?.title ?? "포스팅");
      } catch (error) {
        if (!active) return;

        Alert.alert(
          "채팅 조회 실패",
          error instanceof Error ? error.message : "다시 시도해주세요.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadChat();

    return () => {
      active = false;
    };
  }, [roomId, router]);

  const send = () => {
    if (!input.trim()) return;

    Alert.alert(
      "실시간 채팅 연결 전",
      "채팅 조회 확인 후 메시지 전송 기능을 연결할 예정입니다.",
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
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/chat-list")
            }
          >
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>

          <View style={styles.headerAvatar}>
            <Avatar size={40} />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{partnerName}</Text>

            <Text style={styles.headerPost} numberOfLines={1}>
              {boardTitle}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#1A1A1A" style={styles.loading} />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({
                animated: true,
              })
            }
          >
            {messages.length === 0 ? (
              <Text style={styles.empty}>아직 메시지가 없습니다.</Text>
            ) : (
              messages.map((message) =>
                message.senderId !== myId ? (
                  <View key={message.id} style={styles.otherRow}>
                    <Avatar size={24} />

                    <View style={styles.otherBody}>
                      <View style={[styles.bubble, styles.otherBubble]}>
                        <Text style={styles.otherText}>{message.content}</Text>
                      </View>

                      <Text style={styles.time}>
                        {timeLabel(message.createdAt)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View key={message.id} style={styles.meRow}>
                    <View style={[styles.bubble, styles.meBubble]}>
                      <Text style={styles.meText}>{message.content}</Text>
                    </View>

                    <Text style={styles.time}>
                      {timeLabel(message.createdAt)}
                    </Text>
                  </View>
                ),
              )
            )}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
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

  loading: {
    flex: 1,
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 13,
    color: "#999999",
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

  input: {
    flex: 1,
    height: 40,
    marginRight: 8,
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
