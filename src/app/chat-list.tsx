import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatApi, type ChatRoomListItem } from "@/api";

const tabs = [
  { label: "홈", icon: "home-outline", activeIcon: "home" },
  { label: "포스팅", icon: "add", activeIcon: "add" },
  { label: "채팅", icon: "chatbubble-outline", activeIcon: "chatbubble" },
  { label: "마이", icon: "person-outline", activeIcon: "person" },
] as const;

const timeLabel = (date?: string) => date ? new Date(date).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

export default function ChatList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    chatApi.listRooms(1, 100).then((result) => active && setRooms(result.rooms)).catch((error) => {
      if (active) Alert.alert("채팅 목록 조회 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []));

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
          {loading && <ActivityIndicator color="#1A1A1A" style={{ marginTop: 40 }} />}
          {!loading && rooms.length === 0 && <Text style={styles.empty}>아직 시작한 채팅이 없어요</Text>}
          {rooms.map((room) => (
            <Pressable key={room.id} style={styles.row} onPress={() => router.push({ pathname: "/chat", params: { roomId: room.id } })}>
              <View style={styles.avatarWrap}>
                <Image source={require("../../assets/avatar.png")} style={styles.avatar} resizeMode="contain" />
                {room.unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{room.unreadCount}</Text></View>}
              </View>
              <View style={styles.body}>
                <View style={styles.topLine}>
                  <Text style={styles.name}>{room.otherUser.nickname}</Text>
                  <Text style={styles.time}>{timeLabel(room.lastMessage?.createdAt ?? room.updatedAt)}</Text>
                </View>
                <Text style={styles.post} numberOfLines={1}>{room.board?.title ?? "삭제된 포스팅"}</Text>
                <Text style={[styles.last, room.unreadCount > 0 && styles.lastUnread]} numberOfLines={1}>{room.lastMessage?.content ?? "대화를 시작해보세요"}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.label === "채팅";
            return <Pressable key={tab.label} style={styles.tabItem} onPress={() => goTab(tab.label)}>
              <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? "#F0B36B" : "#999999"} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>;
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", backgroundColor: "#FFFFFF" },
  header: { fontSize: 20, fontWeight: "bold", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  empty: { textAlign: "center", color: "#999999", marginTop: 48, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  avatarWrap: { width: 48, height: 48 },
  avatar: { width: 48, height: 48 },
  badge: { position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#1A1A1A", borderWidth: 1.5, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { fontSize: 9, fontWeight: "bold", color: "#FFFFFF" },
  body: { flex: 1, marginLeft: 12 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 14, fontWeight: "bold" },
  time: { fontSize: 11, color: "#AAAAAA" },
  post: { fontSize: 11, color: "#7A869A", marginTop: 3 },
  last: { fontSize: 12, color: "#555555", marginTop: 4 },
  lastUnread: { color: "#111111", fontWeight: "600" },
  tabBar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#EEEEEE", paddingTop: 8, paddingBottom: 6 },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 10, color: "#999999", marginTop: 2 },
  tabLabelActive: { color: "#F0B36B" },
});
