import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Room = {
  id: number;
  name: string; // 상대방 이름
  post: string; // 어떤 포스팅으로 시작한 대화인지
  last: string; // 마지막 메시지
  time: string;
  unread: number; // 안 읽은 메시지 수
};

// 지금은 예시 데이터예요. 나중에 백엔드 채팅 API(GET /api/chat/rooms)에서 받아온 값으로 바꾸면 돼요.
const initialRooms: Room[] = [
  {
    id: 1,
    name: "박지수",
    post: "AI 기반 탄소발자국 측정 앱",
    last: "프로젝트 경험이 있으신가요?",
    time: "오후 2:34",
    unread: 2,
  },
  {
    id: 2,
    name: "김민준",
    post: "대학생 중고거래 커뮤니티",
    last: "포트폴리오 링크 공유해드릴게요",
    time: "어제",
    unread: 0,
  },
  {
    id: 3,
    name: "이하은",
    post: "지역 소상공인 디지털 전환",
    last: "감사합니다! 곧 연락드릴게요",
    time: "월",
    unread: 0,
  },
];

const tabs = [
  { label: "홈", icon: "home-outline", activeIcon: "home" },
  { label: "포스팅", icon: "add", activeIcon: "add" },
  { label: "채팅", icon: "chatbubble-outline", activeIcon: "chatbubble" },
  { label: "마이", icon: "person-outline", activeIcon: "person" },
] as const;

export default function ChatList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  // 대화방을 열면 안 읽은 표시를 없애고 채팅 화면으로 가요.
  const openRoom = (id: number) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, unread: 0 } : r)));
    router.push("/chat");
  };

  // 하단 탭을 누르면 해당 화면으로 이동해요.
  const goTab = (label: string) => {
    if (label === "홈") router.replace("/");
    if (label === "포스팅") router.push("/write");
    if (label === "마이") router.replace("/mypage");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.header}>채팅</Text>

        <ScrollView>
          {rooms.map((r) => (
            <Pressable key={r.id} style={styles.row} onPress={() => openRoom(r.id)}>
              <View style={styles.avatarWrap}>
                <Image
                  source={require("../../assets/avatar.png")}
                  style={styles.avatar}
                  resizeMode="contain"
                />
                {r.unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{r.unread}</Text>
                  </View>
                )}
              </View>

              <View style={styles.body}>
                <View style={styles.topLine}>
                  <Text style={styles.name}>{r.name}</Text>
                  <Text style={styles.time}>{r.time}</Text>
                </View>
                <Text style={styles.post} numberOfLines={1}>
                  {r.post}
                </Text>
                <Text
                  style={[styles.last, r.unread > 0 && styles.lastUnread]}
                  numberOfLines={1}
                >
                  {r.last}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* 하단 탭 */}
        <View style={styles.tabBar}>
          {tabs.map((t) => {
            const active = t.label === "채팅";
            return (
              <Pressable
                key={t.label}
                style={styles.tabItem}
                onPress={() => goTab(t.label)}
              >
                <Ionicons
                  name={active ? t.activeIcon : t.icon}
                  size={22}
                  color={active ? "#F0B36B" : "#999999"}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  // 웹 브라우저에서 볼 때도 폰 너비처럼 보이게 제한해요.
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
  },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  // 대화 목록
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarWrap: { width: 48, height: 48 },
  avatar: { width: 48, height: 48 },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "bold", color: "#FFFFFF" },
  body: { flex: 1, marginLeft: 12 },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 14, fontWeight: "bold" },
  time: { fontSize: 11, color: "#AAAAAA" },
  post: { fontSize: 11, color: "#7A869A", marginTop: 3 },
  last: { fontSize: 12, color: "#555555", marginTop: 4 },
  lastUnread: { color: "#111111", fontWeight: "600" },

  // 하단 탭
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 10, color: "#999999", marginTop: 2 },
  tabLabelActive: { color: "#F0B36B" },
});
