import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "@/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("입력 확인", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { user } = await authApi.login(email.trim(), password);
      router.replace(user.onboardingCompleted ? "/" : "/onboarding");
    } catch (error) {
      Alert.alert("로그인 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.brandArea}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandName}>GUHAM</Text>

            <Text style={styles.brandDescription}>
              함께할 팀원과 프로젝트를{"\n"}연결해드립니다
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력해주세요"
              placeholderTextColor="#B8B8B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.passwordLabel}>비밀번호</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.loginButton, isSubmitting && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupArea}>
              <Text style={styles.signupGuide}>아직 계정이 없으신가요?</Text>

              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8D99C",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  brandArea: {
    marginTop: 124,
    alignItems: "center",
  },
  logo: {
    width: 76,
    height: 76,
  },
  brandName: {
    marginTop: 10,
    fontFamily: "PretendardBold",
    fontSize: 28,
    color: "#1C1C1C",
  },
  brandDescription: {
    marginTop: 10,
    fontFamily: "PretendardMedium",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#625744",
  },
  form: {
    marginTop: 65,
  },
  label: {
    marginBottom: 8,
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
    color: "#665A45",
  },
  passwordLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
    color: "#665A45",
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    fontFamily: "PretendardRegular",
    fontSize: 13,
    color: "#1C1C1C",
  },
  loginButton: {
    height: 52,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontFamily: "PretendardBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  signupArea: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupGuide: {
    fontFamily: "PretendardRegular",
    fontSize: 12,
    color: "#74664E",
  },
  signupText: {
    marginLeft: 3,
    fontFamily: "PretendardBold",
    fontSize: 12,
    color: "#1C1C1C",
  },
});
