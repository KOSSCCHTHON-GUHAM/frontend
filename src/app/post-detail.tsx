import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 지금은 예시 내용이에요. 나중에 백엔드 API(GET /api/boards/:id)에서 받아온 값으로 바꾸면 돼요.
const post = {
  category: "IT/AI",
  region: "서울 / 온라인",
  title: "AI 기반 탄소발자국 측정 앱",
  author: "박지수",
  authorSkills: ["AI/ML", "Backend"],
  intro:
    "일상 소비 패턴을 분석해 탄소발자국을 실시간으로 측정하고 감축 솔루션을 제안하는 앱입니다. ESG 공모전 출품을 목표로 하고 있습니다.",
  give: ["기획", "AI/ML"],
  need: ["Frontend", "UI/UX"],
  info: [
    { label: "진행 방식", value: "온라인 비대면" },
    { label: "활동 시간", value: "주 2회 / 회당 2시간" },
    { label: "모집 인원", value: "2/4명" },
    { label: "관련 링크", value: "notion.so/carbonapp" },
  ],
};

// AI 추천 매칭 예시예요. 나중에 백엔드 AI 추천 API(/api/ai/recommend) 결과로 바꾸면 돼요.
const candidates = [
  { id: 1, name: "김민준", skills: ["Frontend", "React"] },
  { id: 2, name: "이서연", skills: ["UI/UX", "디자인"] },
  { id: 3, name: "박지호", skills: ["Backend", "Python"] },
];

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

export default function PostDetail() {
  const router = useRouter();
  // 방문자/작성자 보기 전환은 미리보기용이에요. 로그인이 생기면 내가 쓴 글인지 보고 자동으로 정해요.
  const [mode, setMode] = useState<"visitor" | "author">("visitor");
  const [sheetOpen, setSheetOpen] = useState(false);

  const goChatFromSheet = () => {
    setSheetOpen(false);
    // 시트가 닫히는 동안 바로 이동하면 아이폰에서 꼬일 수 있어서 잠깐 기다려요.
    setTimeout(() => router.push("/chat"), 300);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable
            hitSlop={8}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>포스팅 상세</Text>
          <View style={styles.headerRight}>
            <View style={styles.modeToggle}>
              <Pressable
                style={[styles.modeItem, mode === "visitor" && styles.modeItemOn]}
                onPress={() => setMode("visitor")}
              >
                <Text
                  style={[styles.modeText, mode === "visitor" && styles.modeTextOn]}
                >
                  방문자
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeItem, mode === "author" && styles.modeItemOn]}
                onPress={() => setMode("author")}
              >
                <Text
                  style={[styles.modeText, mode === "author" && styles.modeTextOn]}
                >
                  작성자
                </Text>
              </Pressable>
            </View>
            <Pressable hitSlop={8} onPress={() => {}} style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#111111" />
            </Pressable>
          </View>
        </View>

        <ScrollView>
          {/* 제목 + 작성자 */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.grayTag}>
                <Text style={styles.grayTagText}>{post.category}</Text>
              </View>
              <View style={styles.grayTag}>
                <Text style={styles.grayTagText}>{post.region}</Text>
              </View>
            </View>
            <Text style={styles.title}>{post.title}</Text>

            <Pressable style={styles.authorRow} onPress={() => {}}>
              <Avatar size={40} />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author}</Text>
                <View style={styles.row}>
                  {post.authorSkills.map((s) => (
                    <View key={s} style={[styles.tag, styles.tagGive]}>
                      <Text style={[styles.tagText, styles.tagTextGive]}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </Pressable>
          </View>

          {/* 프로젝트 소개 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>프로젝트 소개</Text>
            <Text style={styles.body}>{post.intro}</Text>
          </View>

          {/* GIVE / NEED */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GIVE / NEED</Text>
            <Text style={styles.subLabel}>GIVE — 프로젝트가 제공</Text>
            <View style={styles.row}>
              {post.give.map((s) => (
                <View key={s} style={[styles.tag, styles.tagGive]}>
                  <Text style={[styles.tagText, styles.tagTextGive]}>{s}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.subLabel, { marginTop: 12 }]}>
              NEED — 모집 중인 역할
            </Text>
            <View style={styles.row}>
              {post.need.map((s) => (
                <View key={s} style={[styles.tag, styles.tagNeed]}>
                  <Text style={[styles.tagText, styles.tagTextNeed]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 활동 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>활동 정보</Text>
            {post.info.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 하단 버튼: 방문자는 채팅, 작성자는 매칭 목록 */}
        <View style={styles.footer}>
          {mode === "visitor" ? (
            <Pressable
              style={styles.mainButton}
              onPress={() => router.push("/chat")}
            >
              <Text style={styles.mainButtonText}>채팅 시작하기</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.mainButton}
              onPress={() => setSheetOpen(true)}
            >
              <Text style={styles.mainButtonText}>매칭 목록 보기</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* AI 추천 매칭 (아래에서 올라오는 시트) */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.overlayTouch}
            onPress={() => setSheetOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <View>
                <View style={styles.sheetTitleRow}>
                  <Ionicons name="sparkles" size={13} color="#111111" />
                  <Text style={styles.sheetTitle}>AI 추천 매칭</Text>
                </View>
                <Text style={styles.sheetSub}>NEED 적합도 높은 순으로 추천해요</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setSheetOpen(false)}
              >
                <Ionicons name="close" size={16} color="#444444" />
              </Pressable>
            </View>

            {candidates.map((c, i) => (
              <View
                key={c.id}
                style={[styles.candidate, i === 0 && styles.candidateTop]}
              >
                <Text style={[styles.rank, i === 0 && styles.rankTop]}>
                  {i + 1}
                </Text>
                <Avatar size={36} />
                <View style={styles.candInfo}>
                  <Text style={styles.candName}>{c.name}</Text>
                  <View style={styles.row}>
                    {c.skills.map((s) => (
                      <View key={s} style={[styles.tag, styles.tagGive]}>
                        <Text style={[styles.tagText, styles.tagTextGive]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Pressable style={styles.candChat} onPress={goChatFromSheet}>
                  <Ionicons name="chatbubble-outline" size={12} color="#FFFFFF" />
                  <Text style={styles.candChatText}>채팅</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Modal>
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

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: "bold" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  moreButton: { marginLeft: 12 },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    padding: 2,
  },
  modeItem: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  modeItemOn: { backgroundColor: "#1A1A1A" },
  modeText: { fontSize: 10, color: "#888888" },
  modeTextOn: { color: "#FFFFFF", fontWeight: "bold" },

  // 구역
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 12 },
  body: { fontSize: 13, color: "#444444", lineHeight: 21 },

  // 태그
  grayTag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  grayTagText: { fontSize: 11, color: "#666666" },
  tag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 4,
  },
  tagGive: { backgroundColor: "#E3F2FD" },
  tagNeed: { backgroundColor: "#FCE4EC" },
  tagText: { fontSize: 11, fontWeight: "600" },
  tagTextGive: { color: "#1E88E5" },
  tagTextNeed: { color: "#D81B60" },
  subLabel: { fontSize: 11, color: "#888888", marginBottom: 4 },

  // 작성자
  authorRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  authorInfo: { flex: 1, marginLeft: 12 },
  authorName: { fontSize: 14, fontWeight: "bold" },

  // 활동 정보
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 12, color: "#888888" },
  infoValue: { fontSize: 12, fontWeight: "bold", color: "#222222" },

  // 하단 버튼
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  mainButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F6D68F",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonText: { fontSize: 14, fontWeight: "bold", color: "#222222" },

  // AI 추천 매칭 시트
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouch: { flex: 1 },
  sheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDDDDD",
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitleRow: { flexDirection: "row", alignItems: "center" },
  sheetTitle: { fontSize: 14, fontWeight: "bold", marginLeft: 4 },
  sheetSub: { fontSize: 11, color: "#888888", marginTop: 4 },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  candidate: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "#F8F8F8",
    marginTop: 8,
  },
  candidateTop: { backgroundColor: "#FFF6E5", borderColor: "#F6D68F" },
  rank: { width: 16, fontSize: 12, color: "#999999", fontWeight: "bold" },
  rankTop: { color: "#E0A030" },
  candInfo: { flex: 1, marginLeft: 10 },
  candName: { fontSize: 13, fontWeight: "bold" },
  candChat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },
  candChatText: { fontSize: 11, color: "#FFFFFF", fontWeight: "bold", marginLeft: 4 },
});
