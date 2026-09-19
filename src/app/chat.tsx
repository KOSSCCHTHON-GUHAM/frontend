import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Message = {
  id: number;
  from: "me" | "other";
  text: string;
  time: string;
};

// 지금은 예시 대화예요. 나중에 백엔드 채팅 API에서 받아온 값으로 바꾸면 돼요.
const partner = {
  name: "박지수",
  post: "AI 기반 탄소발자국 측정 앱",
};

const initialMessages: Message[] = [
  { id: 1, from: "other", text: "안녕하세요! 포스팅 보고 연락드렸습니다.", time: "오후 2:10" },
  { id: 2, from: "me", text: "안녕하세요~ 관심 가져주셔서 감사해요 😊", time: "오후 2:11" },
  { id: 3, from: "other", text: "혹시 React 프로젝트 경험이 있으신가요?", time: "오후 2:12" },
  {
    id: 4,
    from: "me",
    text: "네, 실무에서 1년 정도 사용했고 사이드 프로젝트도 2개 정도 진행했어요!",
    time: "오후 2:15",
  },
  { id: 5, from: "other", text: "오, 정말요? 링크 공유해주실 수 있나요?", time: "오후 2:16" },
  { id: 6, from: "me", text: "github.com/yujin-dev 이쪽으로 확인해보세요!", time: "오후 2:20" },
  { id: 7, from: "other", text: "프로젝트 경험이 있으신가요?", time: "오후 2:34" },
];

// 지금 시각을 "오후 2:10" 같은 모양으로 만들어요.
function nowLabel() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${m}`;
}

// 사용자 프로필 이미지예요. 지금은 모든 사용자가 같은 이미지를 써요.
function Avatar({ size }: { size: number }) {
  return (
    <Image
      source={require("../../assets/avatar.png")}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="contain"
    />
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "me", text, time: nowLabel() },
    ]);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* 상단 헤더 */}
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
            <Text style={styles.headerName}>{partner.name}</Text>
            <Text style={styles.headerPost} numberOfLines={1}>
              {partner.post}
            </Text>
          </View>
          <Pressable hitSlop={8} onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#111111" />
          </Pressable>
        </View>

        {/* 메시지 목록 */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m) =>
            m.from === "other" ? (
              <View key={m.id} style={styles.otherRow}>
                <Avatar size={24} />
                <View style={styles.otherBody}>
                  <View style={[styles.bubble, styles.otherBubble]}>
                    <Text style={styles.otherText}>{m.text}</Text>
                  </View>
                  <Text style={styles.time}>{m.time}</Text>
                </View>
              </View>
            ) : (
              <View key={m.id} style={styles.meRow}>
                <View style={[styles.bubble, styles.meBubble]}>
                  <Text style={styles.meText}>{m.text}</Text>
                </View>
                <Text style={styles.time}>{m.time}</Text>
              </View>
            )
          )}
        </ScrollView>

        {/* 입력창 */}
        <View style={styles.inputBar}>
          <Pressable style={styles.aiButton} onPress={() => {}}>
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
          >
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  // 웹 브라우저에서 볼 때도 폰 너비처럼 보이게 제한해요.
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: "#F5F5F5",
  },

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerAvatar: { marginLeft: 8 },
  headerInfo: { flex: 1, marginLeft: 10, marginRight: 8 },
  headerName: { fontSize: 15, fontWeight: "bold" },
  headerPost: { fontSize: 11, color: "#888888", marginTop: 2 },

  // 메시지 목록
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 16 },

  // 말풍선 공통
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  time: { fontSize: 10, color: "#AAAAAA", marginTop: 4 },

  // 상대방 메시지 (왼쪽)
  otherRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  otherBody: { marginLeft: 8, flexShrink: 1, maxWidth: "78%" },
  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
  },
  otherText: { fontSize: 13, color: "#222222", lineHeight: 19 },

  // 내 메시지 (오른쪽)
  meRow: { alignItems: "flex-end", marginBottom: 14 },
  meBubble: {
    backgroundColor: "#1A1A1A",
    borderBottomRightRadius: 4,
    maxWidth: "78%",
  },
  meText: { fontSize: 13, color: "#FFFFFF", lineHeight: 19 },

  // 입력창
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
  sendDisabled: { opacity: 0.4 },
});
