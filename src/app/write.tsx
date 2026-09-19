import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { aiApi, boardsApi, type BoardInput, type UploadImage } from "@/api";

// 선택지 목록이에요. 필요하면 여기만 고치면 돼요.
const categoryOptions = ["IT/AI", "창업", "ESG", "마케팅", "디자인"];
const memberOptions = ["2명", "3명", "4명", "5명", "6명 이상"];
const skillOptions = [
  "기획",
  "디자인",
  "Frontend",
  "Backend",
  "AI/ML",
  "데이터",
  "마케팅",
  "콘텐츠",
  "영상",
  "기타",
];
const regionOptions = ["서울 / 온라인", "경기 / 서울", "부산 / 경남", "전국"];
const methodOptions = ["온라인 비대면", "오프라인 대면", "온·오프라인 병행"];
const timeOptions = [
  "주 1회 / 회당 2시간",
  "주 2회 / 회당 2시간",
  "주 3회 / 회당 2시간",
  "협의 후 결정",
];

// 입력한 내용을 한 덩어리로 모아 둬요.
type Form = {
  title: string;
  category: string;
  members: string;
  intro: string;
  give: string[];
  need: string[];
  region: string;
  method: string;
  time: string;
};

// ---------- 작은 부품들 ----------

function Label({ text, right }: { text: string; right?: string }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{text}</Text>
      {right ? <Text style={styles.labelRight}>{right}</Text> : null}
    </View>
  );
}

// 누르면 아래로 목록이 펼쳐지는 선택 상자예요.
function Select({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable style={styles.select} onPress={() => setOpen(!open)}>
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color="#AAAAAA"
        />
      </Pressable>
      {open && (
        <View style={styles.dropdown}>
          {options.map((o) => (
            <Pressable
              key={o}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  o === value && styles.dropdownTextSelected,
                ]}
              >
                {o}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// GIVE / NEED 역량 고르기: + 버튼으로 목록을 열고 닫아요.
function SkillPicker({
  title,
  hint,
  tone,
  selected,
  onToggle,
  defaultOpen = false,
}: {
  title: string;
  hint: string;
  tone: "give" | "need";
  selected: string[];
  onToggle: (item: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const chipStyle = tone === "give" ? styles.chipGive : styles.chipNeed;
  const chipTextStyle =
    tone === "give" ? styles.chipTextGive : styles.chipTextNeed;
  const chipColor = tone === "give" ? "#1E88E5" : "#D81B60";

  return (
    <View style={styles.field}>
      <View style={styles.skillHeader}>
        <View style={styles.skillTitleRow}>
          <Text style={styles.skillTitle}>{title}</Text>
          <Text style={styles.skillHint}>{hint}</Text>
        </View>
        <Pressable
          style={[styles.plusButton, open && styles.plusButtonOn]}
          onPress={() => setOpen(!open)}
        >
          <Ionicons name="add" size={16} color={open ? "#FFFFFF" : "#666666"} />
        </Pressable>
      </View>

      {selected.length > 0 && (
        <View style={styles.chipRow}>
          {selected.map((s) => (
            <Pressable
              key={s}
              style={[styles.selChip, chipStyle]}
              onPress={() => onToggle(s)}
            >
              <Text style={[styles.selChipText, chipTextStyle]}>{s}</Text>
              <Ionicons
                name="close"
                size={12}
                color={chipColor}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          ))}
        </View>
      )}

      {open && (
        <View style={styles.panel}>
          {skillOptions.map((s) => {
            const on = selected.includes(s);
            return (
              <Pressable
                key={s}
                style={[styles.optChip, on && chipStyle]}
                onPress={() => onToggle(s)}
              >
                <Text style={[styles.optChipText, on && chipTextStyle]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ---------- 화면 ----------

export default function WritePost() {
  const router = useRouter();
  const { boardId } = useLocalSearchParams<{ boardId?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Form>({
    title: "",
    category: "",
    members: "",
    intro: "",
    give: ["기획"],
    need: [],
    region: "",
    method: "",
    time: "",
  });
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [images, setImages] = useState<UploadImage[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(boardId));
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const isEditing = Boolean(boardId);
  const canUseAi = images.length > 0 || links.length > 0;

  useEffect(() => {
    if (!boardId) return;
    let active = true;
    boardsApi.detail(boardId).then(({ board }) => {
      if (!active) return;
      setForm({
        title: board.title,
        category: board.category,
        members: `${board.recruitCount}명`,
        intro: board.content,
        give: board.giveTags,
        need: board.needTags,
        region: board.activityRegion,
        method: board.activityMethod,
        time: board.activityHours,
      });
      setLinks(board.relatedLinks);
      setExistingImageUrls(board.imageUrls);
    }).catch((error) => {
      Alert.alert("포스팅 조회 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
      router.back();
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [boardId, router]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setFormError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggle = (key: "give" | "need", item: string) =>
    set(
      key,
      form[key].includes(item)
        ? form[key].filter((i) => i !== item)
        : [...form[key], item]
    );

  const addLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      Alert.alert("링크 확인", "http:// 또는 https://로 시작하는 링크를 입력해주세요.");
      return;
    }
    setLinks((prev) => [...prev, url]);
    setLinkInput("");
  };

  const goStep = (next: 1 | 2) => {
    setFormError("");
    setStep(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const firstStepError = () => {
    if (!form.title.trim()) return "제목을 입력해주세요.";
    if (!form.category) return "카테고리를 선택해주세요.";
    if (!Number.parseInt(form.members, 10)) return "모집 인원을 선택해주세요.";
    if (!form.intro.trim()) return "프로젝트 소개를 입력해주세요.";
    return "";
  };

  const nextStep = () => {
    const error = firstStepError();
    if (error) {
      setFormError(error);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    goStep(2);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const pickImages = async () => {
    const remaining = 10 - images.length - existingImageUrls.length;
    if (remaining <= 0) {
      Alert.alert("사진 첨부", "사진은 최대 10장까지 첨부할 수 있습니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.9,
    });
    if (result.canceled) return;
    const picked = result.assets.slice(0, remaining).map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `image-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
      file: asset.file,
    }));
    setImages((prev) => [...prev, ...picked]);
  };

  const createAiDraft = async () => {
    if (!canUseAi || aiLoading) return;
    try {
      setAiLoading(true);
      const draft = await aiApi.createDraft(images, links);
      setForm((previous) => ({
        title: draft.title || previous.title,
        category: draft.category || previous.category,
        members: draft.recruitCount > 0 ? `${draft.recruitCount}명` : previous.members,
        intro: draft.content || previous.intro,
        give: draft.giveTags?.length ? draft.giveTags : previous.give,
        need: draft.needTags?.length ? draft.needTags : previous.need,
        region: draft.activityRegion || previous.region,
        method: draft.activityMethod || previous.method,
        time: draft.activityHours || previous.time,
      }));
      if (draft.relatedLinks.length) setLinks(draft.relatedLinks);
      Alert.alert("AI 작성 완료", "자동 작성된 내용을 확인하고 자유롭게 수정해주세요.");
    } catch (error) {
      Alert.alert("AI 작성 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    } finally {
      setAiLoading(false);
    }
  };

  const submit = async () => {
    const recruitCount = Number.parseInt(form.members, 10);
    const stepOneError = firstStepError();
    if (stepOneError) {
      setStep(1);
      setFormError(stepOneError);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    if (!form.region || !form.method || !form.time) {
      setFormError("활동 지역, 진행 방식, 활동 시간을 모두 선택해주세요.");
      return;
    }
    const payload: BoardInput = {
      title: form.title,
      category: form.category,
      recruitCount,
      content: form.intro,
      giveTags: form.give,
      needTags: form.need,
      activityRegion: form.region,
      activityMethod: form.method,
      activityHours: form.time,
      relatedLinks: links,
    };
    try {
      setSubmitting(true);
      setFormError("");
      if (boardId) await boardsApi.update(boardId, payload);
      else await boardsApi.create(payload, images);
      Alert.alert(isEditing ? "수정 완료" : "등록 완료", isEditing ? "포스팅이 수정되었습니다." : "포스팅이 등록되었습니다.");
      router.replace(isEditing ? "/mypage" : "/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "다시 시도해주세요.";
      setFormError(message);
      Alert.alert(isEditing ? "수정 실패" : "등록 실패", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator color="#1A1A1A" style={{ flex: 1 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* 헤더 + 진행 막대 */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={close}>
            <Ionicons name="close" size={22} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>{isEditing ? "포스팅 수정" : "포스팅 작성"}</Text>
          <View style={styles.progress}>
            <View style={[styles.progressBar, styles.progressOn]} />
            <View
              style={[styles.progressBar, step === 2 && styles.progressOn]}
            />
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <>
              {/* AI로 작성 */}
              <Pressable
                style={[styles.aiButton, canUseAi && styles.aiButtonActive]}
                onPress={createAiDraft}
                disabled={!canUseAi || aiLoading}
              >
                {aiLoading ? <ActivityIndicator size="small" color="#1A1A1A" /> : <Ionicons name="sparkles" size={14} color={canUseAi ? "#1A1A1A" : "#999999"} />}
                <Text style={[styles.aiButtonText, canUseAi && styles.aiButtonTextActive]}>
                  {aiLoading ? "AI가 작성 중이에요" : "AI로 작성해요"}
                </Text>
              </Pressable>
              <Text style={styles.aiHint}>
                사진 또는 링크를 첨부하면 AI가 자동으로 작성해드려요
              </Text>

              {/* 사진 첨부 */}
              <View style={styles.field}>
                <Label text="사진 첨부" right={`${images.length + existingImageUrls.length}/10`} />
                <View style={styles.photoRow}>
                <Pressable style={styles.photoBox} onPress={pickImages}>
                  <Ionicons name="camera-outline" size={22} color="#666666" />
                  <Text style={styles.photoText}>사진 추가</Text>
                </Pressable>
                {[...existingImageUrls, ...images.map((image) => image.uri)].map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.previewWrap}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    {index >= existingImageUrls.length && (
                      <Pressable style={styles.previewRemove} onPress={() => setImages((prev) => prev.filter((_, i) => i !== index - existingImageUrls.length))}>
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </Pressable>
                    )}
                  </View>
                ))}
                </View>
              </View>

              {/* 링크 첨부 */}
              <View style={styles.field}>
                <Label text="링크 첨부" />
                <View style={styles.linkRow}>
                  <View style={styles.linkBox}>
                    <Ionicons name="link-outline" size={14} color="#AAAAAA" />
                    <TextInput
                      style={styles.linkInput}
                      placeholder="notion.so, github.com..."
                      placeholderTextColor="#AAAAAA"
                      value={linkInput}
                      onChangeText={setLinkInput}
                      onSubmitEditing={addLink}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <Pressable style={styles.linkAdd} onPress={addLink}>
                    <Ionicons name="add" size={18} color="#666666" />
                  </Pressable>
                </View>
                {links.map((l, i) => (
                  <View key={l + i} style={styles.linkItem}>
                    <Text style={styles.linkItemText} numberOfLines={1}>
                      {l}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={() =>
                        setLinks((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <Ionicons name="close" size={14} color="#999999" />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* 제목 */}
              <View style={styles.field}>
                <Label text="제목" />
                <TextInput
                  style={styles.input}
                  placeholder="프로젝트 제목을 입력해주세요"
                  placeholderTextColor="#AAAAAA"
                  value={form.title}
                  onChangeText={(v) => set("title", v)}
                />
              </View>

              {/* 카테고리 */}
              <View style={styles.field}>
                <Label text="카테고리" />
                <Select
                  value={form.category}
                  placeholder="IT/AI, 창업, ESG..."
                  options={categoryOptions}
                  onChange={(v) => set("category", v)}
                />
              </View>

              {/* 모집 인원 */}
              <View style={styles.field}>
                <Label text="모집 인원" />
                <Select
                  value={form.members}
                  placeholder="몇 명을 모집하나요?"
                  options={memberOptions}
                  onChange={(v) => set("members", v)}
                />
              </View>

              {/* 프로젝트 소개 */}
              <View style={styles.field}>
                <Label text="프로젝트 소개" />
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="프로젝트를 소개해주세요"
                  placeholderTextColor="#AAAAAA"
                  value={form.intro}
                  onChangeText={(v) => set("intro", v)}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* GIVE / NEED */}
              <SkillPicker
                title="GIVE"
                hint="우리가 가진 역량"
                tone="give"
                selected={form.give}
                onToggle={(item) => toggle("give", item)}
              />
              <SkillPicker
                title="NEED"
                hint="필요한 팀원 역량"
                tone="need"
                selected={form.need}
                onToggle={(item) => toggle("need", item)}
                defaultOpen
              />
            </>
          ) : (
            <>
              <View style={styles.field}>
                <Label text="활동 지역" />
                <Select
                  value={form.region}
                  placeholder="서울 / 온라인"
                  options={regionOptions}
                  onChange={(v) => set("region", v)}
                />
              </View>
              <View style={styles.field}>
                <Label text="진행 방식" />
                <Select
                  value={form.method}
                  placeholder="온라인 비대면"
                  options={methodOptions}
                  onChange={(v) => set("method", v)}
                />
              </View>
              <View style={styles.field}>
                <Label text="활동 시간" />
                <Select
                  value={form.time}
                  placeholder="주 2회 / 회당 2시간"
                  options={timeOptions}
                  onChange={(v) => set("time", v)}
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          {formError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#C62828" />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}
          {step === 1 ? (
            <Pressable style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.nextButtonText}>다음</Text>
            </Pressable>
          ) : (
            <View style={styles.footerRow}>
              <Pressable style={styles.prevButton} onPress={() => goStep(1)}>
                <Text style={styles.prevButtonText}>이전</Text>
              </Pressable>
              <Pressable style={[styles.submitButton, submitting && styles.disabledButton]} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.submitButtonText}>{isEditing ? "수정하기" : "등록하기"}</Text>}
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
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

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: "bold" },
  progress: { flexDirection: "row" },
  progressBar: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    marginLeft: 3,
  },
  progressOn: { backgroundColor: "#F8D99C" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  field: { marginTop: 20 },

  // 라벨
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: { fontSize: 13, fontWeight: "bold", color: "#111111" },
  labelRight: { fontSize: 11, color: "#AAAAAA" },

  // AI 버튼
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  aiButtonText: { fontSize: 13, color: "#999999", marginLeft: 6 },
  aiButtonActive: { backgroundColor: "#F6D68F" },
  aiButtonTextActive: { color: "#1A1A1A", fontWeight: "bold" },
  aiHint: {
    fontSize: 11,
    color: "#AAAAAA",
    textAlign: "center",
    marginTop: 8,
  },

  // 사진
  photoBox: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: { fontSize: 10, color: "#666666", marginTop: 4 },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  previewWrap: { width: 72, height: 72 },
  previewImage: { width: 72, height: 72, borderRadius: 10 },
  previewRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  // 링크
  linkRow: { flexDirection: "row", alignItems: "center" },
  linkBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
  },
  linkInput: { flex: 1, marginLeft: 8, fontSize: 13, padding: 0 },
  linkAdd: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
  },
  linkItemText: { flex: 1, fontSize: 12, color: "#555555", marginRight: 8 },

  // 입력 상자
  input: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    fontSize: 13,
  },
  textarea: { height: 110, paddingTop: 12 },

  // 선택 상자
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
  },
  selectText: { fontSize: 13, color: "#111111" },
  placeholderText: { color: "#AAAAAA" },
  dropdown: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  dropdownText: { fontSize: 13, color: "#444444" },
  dropdownTextSelected: { color: "#111111", fontWeight: "bold" },

  // GIVE / NEED
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skillTitleRow: { flexDirection: "row", alignItems: "baseline" },
  skillTitle: { fontSize: 13, fontWeight: "bold" },
  skillHint: { fontSize: 11, color: "#999999", marginLeft: 6 },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  plusButtonOn: { backgroundColor: "#1A1A1A" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  selChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  selChipText: { fontSize: 12, fontWeight: "600" },
  chipGive: { backgroundColor: "#E3F2FD", borderColor: "#E3F2FD" },
  chipNeed: { backgroundColor: "#FCE4EC", borderColor: "#FCE4EC" },
  chipTextGive: { color: "#1E88E5" },
  chipTextNeed: { color: "#D81B60" },
  panel: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "#F8F8F8",
  },
  optChip: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  optChipText: { fontSize: 12, fontWeight: "600", color: "#333333" },

  // 하단 버튼
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
    marginBottom: 10,
  },
  errorText: { flex: 1, marginLeft: 6, fontSize: 12, color: "#C62828" },
  footerRow: { flexDirection: "row" },
  nextButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8D99C",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: { fontSize: 14, fontWeight: "bold", color: "#111111" },
  prevButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  prevButtonText: { fontSize: 14, fontWeight: "bold", color: "#333333" },
  submitButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F6D68F",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  submitButtonText: { fontSize: 14, fontWeight: "bold", color: "#222222" },
  disabledButton: { opacity: 0.6 },
});
