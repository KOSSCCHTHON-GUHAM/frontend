import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { aiApi, boardsApi, chatApi, type Board, type UserProfile } from "@/api";

type Author = { id: string; nickname: string; giveFields?: string[] };
type Candidate = { user: UserProfile; rank: number; matchScore: number; matchedTags: string[]; recommendationReasons: string[] };

function Avatar({ size }: { size: number }) {
  return <Image source={require("../../assets/avatar.png")} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="contain" />;
}

export default function PostDetail() {
  const router = useRouter();
  const { boardId } = useLocalSearchParams<{ boardId?: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!boardId) {
      Alert.alert("포스팅 오류", "포스팅 식별자가 없습니다.");
      router.replace("/");
      return;
    }
    boardsApi.detail(boardId).then((result) => {
      setBoard(result.board);
      setAuthor(result.author);
      setIsOwner(result.permissions.isOwner);
    }).catch((error) => {
      Alert.alert("포스팅 조회 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
      router.replace("/");
    }).finally(() => setLoading(false));
  }, [boardId, router]);

  const openChat = async (targetUserId: string) => {
    if (!board) return;
    try {
      setChatLoading(true);
      const { room } = await chatApi.createRoom(targetUserId, board.id);
      setSheetOpen(false);
      router.push({ pathname: "/chat", params: { roomId: room.id } });
    } catch (error) {
      Alert.alert("채팅방 생성 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleMainAction = async () => {
    if (!board || !author) return;
    if (!isOwner) {
      await openChat(author.id);
      return;
    }
    try {
      setChatLoading(true);
      const result = await aiApi.recommendUsers(board.id, 10);
      setCandidates(result.recommendations);
      setSheetOpen(true);
    } catch (error) {
      Alert.alert("추천 사용자 조회 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading || !board) {
    return <SafeAreaView style={styles.safe}><ActivityIndicator color="#1A1A1A" style={{ flex: 1 }} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>포스팅 상세</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView>
          <View style={styles.section}>
            <View style={styles.row}>
              {[board.category, board.activityRegion].map((item) => <View key={item} style={styles.grayTag}><Text style={styles.grayTagText}>{item}</Text></View>)}
            </View>
            <Text style={styles.title}>{board.title}</Text>
            <View style={styles.authorRow}>
              <Avatar size={40} />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{author?.nickname ?? "사용자"}</Text>
                <View style={styles.row}>
                  {(author?.giveFields ?? []).map((skill) => <View key={skill} style={[styles.tag, styles.tagGive]}><Text style={[styles.tagText, styles.tagTextGive]}>{skill}</Text></View>)}
                </View>
              </View>
            </View>
          </View>

          {board.imageUrls.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {board.imageUrls.map((url) => <Image key={url} source={{ uri: url }} style={styles.galleryImage} />)}
            </ScrollView>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>프로젝트 소개</Text>
            <Text style={styles.body}>{board.content}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GIVE / NEED</Text>
            <Text style={styles.subLabel}>GIVE — 프로젝트가 제공</Text>
            <View style={styles.row}>{board.giveTags.map((tag) => <View key={tag} style={[styles.tag, styles.tagGive]}><Text style={[styles.tagText, styles.tagTextGive]}>{tag}</Text></View>)}</View>
            <Text style={[styles.subLabel, { marginTop: 12 }]}>NEED — 모집 중인 역할</Text>
            <View style={styles.row}>{board.needTags.map((tag) => <View key={tag} style={[styles.tag, styles.tagNeed]}><Text style={[styles.tagText, styles.tagTextNeed]}>{tag}</Text></View>)}</View>
          </View>

          <View style={styles.section}>
            {[
              ["진행 방식", board.activityMethod],
              ["활동 시간", board.activityHours],
              ["모집 인원", `${board.recruitment.current}/${board.recruitment.target}명`],
              ["관련 링크", board.relatedLinks.join(", ") || "없음"],
            ].map(([label, value]) => <View key={label} style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>)}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.mainButton, chatLoading && styles.disabled]} onPress={handleMainAction} disabled={chatLoading}>
            {chatLoading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.mainButtonText}>{isOwner ? "AI 추천 팀원 보기" : "채팅 시작하기"}</Text>}
          </Pressable>
        </View>
      </View>

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.overlayTouch} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>AI 추천 팀원</Text>
            {candidates.length === 0 && <Text style={styles.empty}>추천할 사용자가 없습니다.</Text>}
            {candidates.map((candidate) => (
              <View key={candidate.user.id} style={styles.candidate}>
                <Text style={styles.rank}>{candidate.rank}</Text>
                <Avatar size={36} />
                <View style={styles.candidateInfo}>
                  <Text style={styles.authorName}>{candidate.user.nickname} · {candidate.matchScore}점</Text>
                  <Text style={styles.subLabel}>{candidate.matchedTags.join(", ") || candidate.recommendationReasons.join(", ")}</Text>
                </View>
                <Pressable style={styles.candidateChat} onPress={() => openChat(candidate.user.id)}><Text style={styles.candidateChatText}>채팅</Text></Pressable>
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
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  headerTitle: { fontSize: 15, fontWeight: "bold" },
  section: { backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingVertical: 16, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  grayTag: { backgroundColor: "#F0F0F0", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 },
  grayTagText: { fontSize: 11, color: "#666666" },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 12 },
  authorRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  authorInfo: { flex: 1, marginLeft: 12 },
  authorName: { fontSize: 14, fontWeight: "bold" },
  gallery: { padding: 16, gap: 8, backgroundColor: "#FFFFFF", marginBottom: 8 },
  galleryImage: { width: 140, height: 100, borderRadius: 12, backgroundColor: "#EEEEEE" },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 10 },
  body: { fontSize: 13, color: "#444444", lineHeight: 21 },
  subLabel: { fontSize: 11, color: "#888888", marginTop: 4 },
  tag: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginTop: 4 },
  tagGive: { backgroundColor: "#E3F2FD" },
  tagNeed: { backgroundColor: "#FCE4EC" },
  tagText: { fontSize: 11, fontWeight: "600" },
  tagTextGive: { color: "#1E88E5" },
  tagTextNeed: { color: "#D81B60" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  infoLabel: { fontSize: 12, color: "#888888" },
  infoValue: { flex: 1, textAlign: "right", fontSize: 12, fontWeight: "bold", color: "#222222", marginLeft: 16 },
  footer: { padding: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#EEEEEE" },
  mainButton: { height: 48, borderRadius: 12, backgroundColor: "#F6D68F", alignItems: "center", justifyContent: "center" },
  mainButtonText: { fontSize: 14, fontWeight: "bold", color: "#222222" },
  disabled: { opacity: 0.6 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  overlayTouch: { flex: 1 },
  sheet: { width: "100%", maxWidth: 480, maxHeight: "65%", alignSelf: "center", backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  handle: { alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDDDDD", marginBottom: 14 },
  sheetTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  candidate: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  rank: { width: 22, fontSize: 12, fontWeight: "bold", color: "#E0A030" },
  candidateInfo: { flex: 1, marginLeft: 10 },
  candidateChat: { backgroundColor: "#1A1A1A", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  candidateChatText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  empty: { paddingVertical: 20, textAlign: "center", color: "#999999" },
});
