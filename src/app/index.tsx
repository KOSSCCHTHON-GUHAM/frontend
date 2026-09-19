import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { apiFetch } from "../api/client";

type Tag = { type: "GIVE" | "NEED"; label: string };

// 백엔드 GET /api/boards가 돌려주는 게시글 하나의 모양이에요.
type BoardDetail = {
  id: string;
  title: string;
  category: string;
  content: string;
  giveTags: string[];
  needTags: string[];
  activityRegion: string;
  activityMethod: string;
  activityHours: string;
  recruitCount: number;
  recruitment: { current: number; target: number; status: string };
  createdAt: string;
  author?: { id: string; nickname: string };
};

type BoardsResponse = {
  boards: BoardDetail[];
  total: number;
  page: number;
  hasNext: boolean;
};

const categories = ["전체", "IT/AI", "창업", "ESG", "마케팅", "디자인"];

// 하단 탭: 나중에 Expo Router의 진짜 탭 이동으로 바꿀 자리예요.
const tabs = [
  { label: "홈", icon: "home-outline", activeIcon: "home" },
  { label: "포스팅", icon: "add", activeIcon: "add" },
  { label: "채팅", icon: "chatbubble-outline", activeIcon: "chatbubble" },
  { label: "마이", icon: "person-outline", activeIcon: "person" },
] as const;

// 사용자 프로필 이미지예요. 지금은 모든 사용자가 같은 이미지를 써요.
function Avatar({ size = 24 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/avatar.png")}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="contain"
    />
  );
}

// "2024-05-01T10:00:00Z" 같은 시각을 "2시간 전" 같은 문구로 바꿔줘요.
function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function Home() {
  const router = useRouter();
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recommend" | "latest">("recommend");

  const [boards, setBoards] = useState<BoardDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 / 검색어 / 정렬이 바뀔 때마다 백엔드에서 목록을 다시 받아와요.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (category !== "전체") params.set("category", category);
      if (query.trim()) params.set("keyword", query.trim());
      params.set("sort", sort === "latest" ? "LATEST" : "RECOMMENDED");

      setLoading(true);
      setError(null);
      apiFetch<BoardsResponse>(`/api/boards?${params.toString()}`)
        .then((res) => setBoards(res.boards))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "목록을 불러오지 못했어요")
        )
        .finally(() => setLoading(false));
    }, 300); // 타이핑 중간마다 요청 보내지 않도록 살짝 기다려요.

    return () => clearTimeout(timer);
  }, [category, query, sort]);

  // 하단 탭을 누르면 해당 화면으로 이동해요.
  const goTab = (label: string) => {
    if (label === "포스팅") router.push("/write");
    if (label === "채팅") router.replace("/chat-list");
    if (label === "마이") router.replace("/mypage");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoName}>GUHAM</Text>
          </View>
          <Pressable hitSlop={8} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color="#111111" />
          </Pressable>
        </View>

        {/* 카테고리 칩 */}
        <View style={styles.topArea}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {categories.map((c) => {
              const selected = c === category;
              return (
                <Pressable
                  key={c}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextSelected]}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 검색창 + 정렬 */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={14} color="#AAAAAA" />
              <TextInput
                style={styles.searchInput}
                placeholder="검색"
                placeholderTextColor="#AAAAAA"
                value={query}
                onChangeText={setQuery}
              />
            </View>
            <View style={styles.segment}>
              <Pressable
                style={[
                  styles.segmentItem,
                  sort === "recommend" && styles.segmentSelected,
                ]}
                onPress={() => setSort("recommend")}
              >
                <Ionicons
                  name="sparkles"
                  size={10}
                  color={sort === "recommend" ? "#111111" : "#888888"}
                />
                <Text
                  style={[
                    styles.segmentText,
                    sort === "recommend" && styles.segmentTextSelected,
                  ]}
                >
                  추천순
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentItem,
                  sort === "latest" && styles.segmentSelected,
                ]}
                onPress={() => setSort("latest")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    sort === "latest" && styles.segmentTextSelected,
                  ]}
                >
                  최신순
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 포스팅 목록 */}
        <ScrollView contentContainerStyle={styles.list}>
          {loading && <ActivityIndicator style={{ marginTop: 40 }} color="#1A1A1A" />}

          {!loading && error && (
            <Text style={styles.empty}>{error}{"\n"}백엔드 서버가 켜져 있는지 확인해주세요.</Text>
          )}

          {!loading && !error && boards.length === 0 && (
            <Text style={styles.empty}>조건에 맞는 포스팅이 없어요</Text>
          )}

          {!loading &&
            !error &&
            boards.map((post) => {
              const tags: Tag[] = [
                ...post.giveTags.map((label) => ({ type: "GIVE" as const, label })),
                ...post.needTags.map((label) => ({ type: "NEED" as const, label })),
              ];
              return (
                <Pressable
                  key={post.id}
                  style={styles.card}
                  onPress={() =>
                    router.push({ pathname: "/post-detail", params: { id: post.id } })
                  }
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.meta}>
                      {post.category} · {post.activityRegion}
                    </Text>
                    <Text style={styles.ago}>{timeAgo(post.createdAt)}</Text>
                  </View>
                  <Text style={styles.title}>{post.title}</Text>
                  <View style={styles.tagRow}>
                    {tags.map((tag) => (
                      <View
                        key={tag.type + tag.label}
                        style={[
                          styles.tag,
                          tag.type === "GIVE" ? styles.tagGive : styles.tagNeed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            tag.type === "GIVE"
                              ? styles.tagTextGive
                              : styles.tagTextNeed,
                          ]}
                        >
                          {tag.type} · {tag.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.authorRow}>
                      <Avatar size={24} />
                      <Text style={styles.author}>
                        {post.author?.nickname ?? "익명"}
                      </Text>
                    </View>
                    <Text style={styles.recruit}>
                      모집 {post.recruitment.current}/{post.recruitment.target}명
                    </Text>
                  </View>
                </Pressable>
              );
            })}
        </ScrollView>

        {/* 하단 탭 */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.label === "홈";
            return (
              <Pressable
                key={tab.label}
                style={styles.tabItem}
                onPress={() => goTab(tab.label)}
              >
                <Ionicons
                  name={active ? tab.activeIcon : tab.icon}
                  size={22}
                  color={active ? "#F0B36B" : "#999999"}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
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

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 26, height: 26 },
  logoName: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },

  // 칩 + 검색 영역
  topArea: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  chipRow: { paddingHorizontal: 20, paddingVertical: 4 },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A" },
  chipText: { fontSize: 12, color: "#444444" },
  chipTextSelected: { color: "#FFFFFF", fontWeight: "bold" },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 12, padding: 0 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 2,
    marginLeft: 8,
  },
  segmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  segmentSelected: { backgroundColor: "#FFFFFF" },
  segmentText: { fontSize: 11, color: "#888888", marginLeft: 2 },
  segmentTextSelected: { color: "#111111", fontWeight: "bold" },

  // 목록
  list: { padding: 16 },
  empty: { textAlign: "center", color: "#999999", marginTop: 40, fontSize: 13 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 11, color: "#888888" },
  ago: { fontSize: 11, color: "#AAAAAA" },
  title: { fontSize: 15, fontWeight: "bold", marginTop: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  tag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagGive: { backgroundColor: "#E3F2FD" },
  tagNeed: { backgroundColor: "#FCE4EC" },
  tagText: { fontSize: 11, fontWeight: "600" },
  tagTextGive: { color: "#1E88E5" },
  tagTextNeed: { color: "#D81B60" },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  author: { fontSize: 12, color: "#666666", marginLeft: 6 },
  recruit: { fontSize: 11, color: "#888888" },

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
