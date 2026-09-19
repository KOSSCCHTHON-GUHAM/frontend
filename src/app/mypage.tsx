import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authApi } from "@/api";

// 지금은 예시 데이터예요. 나중에 백엔드 API에서 받아온 값으로 바꾸면 돼요.
const user = {
  name: "유진(yujin_dev)",
  tags: ["Frontend", "UI/UX"],
  interests: ["IT/AI", "창업", "디자인", "ESG"],
  regions: ["서울", "온라인"],
};

type MyPost = { id: number; title: string; meta: string; closed: boolean };

const initialPosts: MyPost[] = [
  { id: 1, title: "AI 기반 탄소발자국 측정 앱", meta: "IT/AI · 모집 2/4명", closed: false },
  { id: 2, title: "대학생 중고거래 커뮤니티 플랫폼", meta: "창업 · 모집 1/3명", closed: false },
  // 디자인에는 없는 예시예요. "모집 완료" 전환을 눌렀을 때 보이는 모습을 확인하려고 넣었어요.
  { id: 3, title: "캠퍼스 스터디 매칭 서비스", meta: "IT/AI · 모집 3/3명", closed: true },
];

const tabs = [
  { label: "홈", icon: "home-outline", activeIcon: "home" },
  { label: "포스팅", icon: "add", activeIcon: "add" },
  { label: "채팅", icon: "chatbubble-outline", activeIcon: "chatbubble" },
  { label: "마이", icon: "person-outline", activeIcon: "person" },
] as const;

function SmallButton({
  label,
  onPress,
  big,
}: {
  label: string;
  onPress?: () => void;
  big?: boolean;
}) {
  return (
    <Pressable
      style={[styles.smallButton, big && styles.bigButton]}
      onPress={onPress}
    >
      <Text style={[styles.smallButtonText, big && styles.bigButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function MyPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.replace("/login");
    } catch (error) {
      Alert.alert("로그아웃 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    }
  };
  const [posts, setPosts] = useState<MyPost[]>(initialPosts);
  const [tab, setTab] = useState<"open" | "closed">("open");

  // 선택한 탭(모집 중 / 모집 완료)에 맞는 글만 보여줘요.
  const visible = posts.filter((p) => p.closed === (tab === "closed"));

  const askDelete = (id: number) => {
    const remove = () => setPosts((prev) => prev.filter((p) => p.id !== id));
    if (Platform.OS === "web") {
      if (window.confirm("이 포스팅을 삭제할까요?")) remove();
    } else {
      Alert.alert("삭제", "이 포스팅을 삭제할까요?", [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: remove },
      ]);
    }
  };

  // 하단 탭을 누르면 해당 화면으로 이동해요.
  const goTab = (label: string) => {
    if (label === "홈") router.replace("/");
    if (label === "포스팅") router.push("/write");
    if (label === "채팅") router.replace("/chat-list");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.header}>마이</Text>

          {/* 프로필 */}
          <View style={[styles.section, styles.profileSection]}>
            <View style={styles.profileRow}>
              <Image
                source={require("../../assets/avatar.png")}
                style={styles.avatar}
                resizeMode="contain"
              />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user.name}</Text>
                <View style={styles.row}>
                  {user.tags.map((tag) => (
                    <View key={tag} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <SmallButton label="수정" big onPress={() => {}} />
            </View>
          </View>

          {/* 관심 분야 + 활동 지역 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>관심 분야</Text>
            <View style={styles.row}>
              {user.interests.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>
              활동 지역
            </Text>
            <View style={styles.row}>
              {user.regions.map((item) => (
                <View key={item} style={[styles.chip, styles.chipWithIcon]}>
                  <Ionicons name="location-outline" size={11} color="#777777" />
                  <Text style={[styles.chipText, styles.chipTextIcon]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 내가 작성한 포스팅 */}
          <View style={styles.section}>
            <View style={styles.postsHeader}>
              <View style={styles.row}>
                <Text style={styles.sectionTitleInline}>내가 작성한 포스팅</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{visible.length}</Text>
                </View>
              </View>
              <View style={styles.segment}>
                <Pressable
                  style={[styles.segmentItem, tab === "open" && styles.segmentOn]}
                  onPress={() => setTab("open")}
                >
                  <Text
                    style={[styles.segmentText, tab === "open" && styles.segmentTextOn]}
                  >
                    모집 중
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmentItem, tab === "closed" && styles.segmentOn]}
                  onPress={() => setTab("closed")}
                >
                  <Text
                    style={[styles.segmentText, tab === "closed" && styles.segmentTextOn]}
                  >
                    모집 완료
                  </Text>
                </Pressable>
              </View>
            </View>

            {visible.length === 0 && (
              <Text style={styles.empty}>
                {tab === "open"
                  ? "모집 중인 포스팅이 없어요"
                  : "모집 완료된 포스팅이 없어요"}
              </Text>
            )}
            {visible.map((post) => (
              <View key={post.id} style={styles.postItem}>
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postMeta}>{post.meta}</Text>
                </View>
                <View style={styles.row}>
                  <SmallButton label="수정" onPress={() => router.push("/write")} />
                  <SmallButton label="삭제" onPress={() => askDelete(post.id)} />
                </View>
              </View>
            ))}
          </View>

          <Pressable style={[styles.section, styles.logoutRow]} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
            <Ionicons name="chevron-forward" size={18} color="#999999" />
          </Pressable>
        </ScrollView>

        {/* 하단 탭 */}
        <View style={styles.tabBar}>
          {tabs.map((t) => {
            const active = t.label === "마이";
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
    backgroundColor: "#F5F5F5",
  },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 10 },
  sectionTitleGap: { marginTop: 16 },
  sectionTitleInline: { fontSize: 13, fontWeight: "bold" },

  // 프로필
  profileSection: { paddingTop: 8 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60 },
  profileInfo: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  skillTag: {
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  skillTagText: { fontSize: 11, color: "#1E88E5", fontWeight: "600" },

  // 칩 (관심 분야 / 활동 지역)
  chip: {
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 4,
  },
  chipWithIcon: { flexDirection: "row", alignItems: "center" },
  chipText: { fontSize: 11, color: "#555555" },
  chipTextIcon: { marginLeft: 3 },

  // 내가 작성한 포스팅
  postsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#FFFFFF" },
  segment: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 2,
  },
  segmentItem: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  segmentOn: { backgroundColor: "#1A1A1A" },
  segmentText: { fontSize: 11, color: "#888888" },
  segmentTextOn: { color: "#FFFFFF", fontWeight: "bold" },
  empty: {
    textAlign: "center",
    color: "#999999",
    fontSize: 12,
    paddingVertical: 24,
  },
  postItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  postInfo: { flex: 1, marginRight: 8 },
  postTitle: { fontSize: 13, fontWeight: "bold" },
  postMeta: { fontSize: 11, color: "#888888", marginTop: 4 },

  // 작은 버튼 (수정 / 삭제)
  smallButton: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
    backgroundColor: "#FFFFFF",
  },
  smallButtonText: { fontSize: 11, color: "#444444" },
  bigButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8 },
  bigButtonText: { fontSize: 12 },

  // 로그아웃
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutText: { fontSize: 13, color: "#666666" },

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
