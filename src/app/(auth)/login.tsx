import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
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

import { authApi } from "../../api/auth";

type LoginVariables = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginVariables) =>
      authApi.login(email, password),

    onSuccess: (data) => {
      if (data.user.onboardingCompleted) {
        router.replace("/?loggedIn=true");
        return;
      }

      router.replace("/onboarding");
    },

    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다.";

      Alert.alert("로그인 실패", message);
    },
  });

  const handleLogin = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    loginMutation.mutate({
      email: trimmedEmail,
      password,
    });
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
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
              autoCorrect={false}
              editable={!loginMutation.isPending}
              returnKeyType="next"
              style={styles.input}
            />

            <Text style={styles.passwordLabel}>비밀번호</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              editable={!loginMutation.isPending}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              style={styles.input}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.loginButton,
                loginMutation.isPending && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              <Text style={styles.loginButtonText}>
                {loginMutation.isPending ? "로그인 중..." : "로그인"}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupArea}>
              <Text style={styles.signupGuide}>
                아직 계정이 없으신가요?
              </Text>

              <TouchableOpacity
                onPress={handleSignup}
                disabled={loginMutation.isPending}
              >
                <Text style={styles.signupText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 30,
  },
  brandArea: {
    alignItems: "center",
    marginTop: 124,
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
    marginTop: 40,
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
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: "PretendardBold",
    fontSize: 15,
    color: "#FFFFFF",
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