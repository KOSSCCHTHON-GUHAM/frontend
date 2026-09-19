import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "@/api";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNicknameCheck = async () => {
    if (nickname.trim().length < 2 || nickname.trim().length > 10) {
      Alert.alert("입력 확인", "닉네임은 2~10자로 입력해주세요.");
      return;
    }
    try {
      const result = await authApi.checkNickname(nickname.trim());
      setNicknameChecked(result.isAvailable);
      Alert.alert("닉네임 확인", result.message);
    } catch (error) {
      Alert.alert("확인 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    }
  };

  const handleSignup = async () => {
    if (!email.trim() || !password || !nickname.trim()) {
      Alert.alert("입력 확인", "모든 항목을 입력해주세요.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("입력 확인", "비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("입력 확인", "비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (!nicknameChecked) {
      Alert.alert("입력 확인", "닉네임 중복확인을 해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.register(email.trim(), password, nickname.trim());
      Alert.alert("가입 완료", "로그인 후 온보딩을 진행해주세요.", [
        { text: "확인", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      Alert.alert("회원가입 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#1C1C1C" />
          </TouchableOpacity>

          <View style={styles.titleArea}>
            <Text style={styles.title}>계정을{"\n"}만들어보세요</Text>

            <Text style={styles.subtitle}>
              정보를 입력하고 팀원을 찾아보세요
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일 형식으로 입력해주세요"
              placeholderTextColor="#B8B8B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>비밀번호</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상 입력해주세요"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>비밀번호 확인</Text>

            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>닉네임</Text>

            <View style={styles.nicknameInput}>
              <TextInput
                value={nickname}
                onChangeText={(value) => {
                  setNickname(value);
                  setNicknameChecked(false);
                }}
                placeholder="2~10자 이내로 입력해주세요"
                placeholderTextColor="#B8B8B8"
                style={styles.nicknameTextInput}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.checkButton}
                onPress={handleNicknameCheck}
              >
                <Text style={styles.checkButtonText}>
                  {nicknameChecked ? "확인완료" : "중복확인"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.signupButton, isSubmitting && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#1C1C1C" />
              ) : (
                <Text style={styles.signupButtonText}>가입 완료</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    marginTop: 4,
    marginLeft: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    marginTop: 77,
  },
  title: {
    fontFamily: "PretendardBold",
    fontSize: 24,
    lineHeight: 30,
    color: "#1C1C1C",
  },
  subtitle: {
    marginTop: 8,
    fontFamily: "PretendardRegular",
    fontSize: 12,
    color: "#999999",
  },
  form: {
    marginTop: 38,
  },
  label: {
    marginBottom: 8,
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
    color: "#858585",
  },
  fieldLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
    color: "#858585",
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    fontFamily: "PretendardRegular",
    fontSize: 13,
    color: "#1C1C1C",
  },
  nicknameInput: {
    height: 48,
    paddingLeft: 16,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
  },
  nicknameTextInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: "PretendardRegular",
    fontSize: 13,
    color: "#1C1C1C",
  },
  checkButton: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  checkButtonText: {
    fontFamily: "PretendardMedium",
    fontSize: 12,
    color: "#A7A7A7",
  },
  signupButton: {
    height: 52,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: "#F8D99C",
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    fontFamily: "PretendardBold",
    fontSize: 15,
    color: "#1C1C1C",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
