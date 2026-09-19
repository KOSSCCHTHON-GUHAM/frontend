import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { aiApi, boardsApi, type Board } from "@/api";
import { sessionStore } from "@/auth/session";

type Tag = { type: "GIVE" | "NEED"; label: string };

type Post = Board & {
  author?: { id: string; nickname: string };
  matchScore?: number;
  recommendationReasons?: string[];
};

const categories = ["전체", "IT/AI", "창업", "ESG", "마케팅", "디자인"];

const relativeTime = (date: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1440)}일 전`;
};

const tabs = [
  { label: "홈", icon: "home-outline", activeIcon: "home" },
  { label: "포스팅", icon: "add", activeIcon: "add" },
  { label: "채팅", icon: "chatbubble-outline", activeIcon: "chatbubble" },
  { label: "마이", icon: "person-outline", activeIcon: "person" },
] as const;

function Avatar({ size = 24 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/avatar.png")}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="contain"
    />
  );
}

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recommend" | "latest">("recommend");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionStore.getAccessToken().then((token) => {
      setIsAuthenticated(Boolean(token));
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setLoading(true);
    const load = sort === "recommend"
      ? aiApi.recommendBoards({ category: category === "전체" ? undefined : category, keyword: query || undefined, limit: 50 })
      : boardsApi.list({ category: category === "전체" ? undefined : category, keyword: query || undefined, sort: "LATEST", limit: 50 });
    load.then((result) => {
      if (active) setPosts(result.boards as Post[]);
    }).catch((error) => {
      if (active) Alert.alert("포스팅 조회 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isAuthenticated, category, query, sort]);

  const visible = posts;

  const goTab = (label: string) => {
    if (label === "포스팅") router.push("/write");
    if (label === "채팅") router.replace("/chat-list");
    if (label === "마이") router.replace("/mypage");
  };

  if (!authChecked) return null;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
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

        <View style={styles.topArea}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {categories.map((item) => {
              const selected = item === category;

              return (
                <Pressable
                  key={item}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

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

        <ScrollView contentContainerStyle={styles.list}>
          {loading && <ActivityIndicator color="#1A1A1A" style={{ marginTop: 40 }} />}
          {visible.length === 0 && (
            <Text style={styles.empty}>조건에 맞는 포스팅이 없어요</Text>
          )}

          {visible.map((post) => (
            <Pressable
              key={post.id}
              style={styles.card}
              onPress={() => router.push({ pathname: "/post-detail", params: { boardId: post.id } })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.meta}>
                  {post.category} · {post.activityRegion}
                </Text>
                <Text style={styles.ago}>{relativeTime(post.createdAt)}</Text>
              </View>

              <Text style={styles.title}>{post.title}</Text>

              <View style={styles.tagRow}>
                {[
                  ...post.giveTags.map((label) => ({ type: "GIVE" as const, label })),
                  ...post.needTags.map((label) => ({ type: "NEED" as const, label })),
                ].map((tag) => (
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
                  <Text style={styles.author}>{post.author?.nickname ?? "사용자"}</Text>
                </View>

                <Text style={styles.recruit}>
                  모집 {post.recruitment.current}/{post.recruitment.target}명
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

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

                <Text
                  style={[styles.tabLabel, active && styles.tabLabelActive]}
                >
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
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 26,
    height: 26,
  },
  logoName: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  chipRow: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  chipText: {
    fontSize: 12,
    color: "#444444",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
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
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    padding: 0,
  },
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
  segmentSelected: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 11,
    color: "#888888",
    marginLeft: 2,
  },
  segmentTextSelected: {
    color: "#111111",
    fontWeight: "bold",
  },
  list: {
    padding: 16,
  },
  empty: {
    textAlign: "center",
    color: "#999999",
    marginTop: 40,
    fontSize: 13,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 11,
    color: "#888888",
  },
  ago: {
    fontSize: 11,
    color: "#AAAAAA",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagGive: {
    backgroundColor: "#E3F2FD",
  },
  tagNeed: {
    backgroundColor: "#FCE4EC",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tagTextGive: {
    color: "#1E88E5",
  },
  tagTextNeed: {
    color: "#D81B60",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 6,
  },
  recruit: {
    fontSize: 11,
    color: "#888888",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10,
    color: "#999999",
    marginTop: 2,
  },
  tabLabelActive: {
    color: "#F0B36B",
  },
});
