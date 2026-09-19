import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
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

import { authApi } from "../../api/auth";

type SignupVariables = {
  email: string;
  password: string;
  nickname: string;
};

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [checkedNickname, setCheckedNickname] = useState("");

  const nicknameMutation = useMutation({
    mutationFn: (nickname: string) => authApi.checkNickname(nickname),

    onSuccess: (data) => {
      if (data.isAvailable) {
        setCheckedNickname(nickname.trim());
      } else {
        setCheckedNickname("");
      }

      Alert.alert("닉네임 중복 확인", data.message);
    },

    onError: (error) => {
      setCheckedNickname("");

      const message =
        error instanceof Error
          ? error.message
          : "닉네임을 확인하지 못했습니다.";

      Alert.alert("중복 확인 실패", message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({ email, password, nickname }: SignupVariables) =>
      authApi.register(email, password, nickname),

    onSuccess: () => {
      Alert.alert("가입 완료", "회원가입이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/login"),
        },
      ]);
    },

    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다.";

      Alert.alert("회원가입 실패", message);
    },
  });

  const handleNicknameChange = (value: string) => {
    setNickname(value);

    if (checkedNickname) {
      setCheckedNickname("");
    }
  };

  const handleNicknameCheck = () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      Alert.alert("알림", "닉네임을 입력해주세요.");
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      Alert.alert("알림", "닉네임은 2~10자로 입력해주세요.");
      return;
    }

    nicknameMutation.mutate(trimmedNickname);
  };

  const handleSignup = () => {
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedEmail || !password || !passwordConfirm || !trimmedNickname) {
      Alert.alert("알림", "모든 정보를 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("알림", "비밀번호는 8자 이상 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      Alert.alert("알림", "닉네임은 2~10자로 입력해주세요.");
      return;
    }

    if (checkedNickname !== trimmedNickname) {
      Alert.alert("알림", "닉네임 중복확인을 해주세요.");
      return;
    }

    signupMutation.mutate({
      email: trimmedEmail,
      password,
      nickname: trimmedNickname,
    });
  };

  const isPending =
    nicknameMutation.isPending || signupMutation.isPending;

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
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
            disabled={isPending}
          >
            <Ionicons name="chevron-back" size={24} color="#1C1C1C" />
          </TouchableOpacity>

          <View style={styles.titleArea}>
            <Text style={styles.title}>
              계정을{"\n"}만들어보세요
            </Text>

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
              autoCorrect={false}
              editable={!isPending}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>비밀번호</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상 입력해주세요"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              editable={!isPending}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>비밀번호 확인</Text>

            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#B8B8B8"
              secureTextEntry
              editable={!isPending}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>닉네임</Text>

            <View style={styles.nicknameInput}>
              <TextInput
                value={nickname}
                onChangeText={handleNicknameChange}
                placeholder="2~10자 이내로 입력해주세요"
                placeholderTextColor="#B8B8B8"
                maxLength={10}
                editable={!isPending}
                style={styles.nicknameTextInput}
              />

              <TouchableOpacity
                onPress={handleNicknameCheck}
                disabled={isPending}
              >
                <Text style={styles.checkText}>
                  {nicknameMutation.isPending
                    ? "확인 중"
                    : checkedNickname === nickname.trim() && checkedNickname
                      ? "확인 완료"
                      : "중복확인"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.signupButton,
                signupMutation.isPending && styles.disabledButton,
              ]}
              activeOpacity={0.85}
              onPress={handleSignup}
              disabled={isPending}
            >
              <Text style={styles.signupButtonText}>
                {signupMutation.isPending ? "가입 중..." : "가입 완료"}
              </Text>
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
    marginTop: 6,
    marginLeft: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    marginTop: 64,
  },
  title: {
    fontFamily: "PretendardBold",
    fontSize: 28,
    lineHeight: 36,
    color: "#1C1C1C",
  },
  subtitle: {
    marginTop: 8,
    fontFamily: "PretendardRegular",
    fontSize: 13,
    color: "#9A9A9A",
  },
  form: {
    marginTop: 32,
  },
  label: {
    marginBottom: 8,
    fontFamily: "PretendardMedium",
    fontSize: 12,
    color: "#8A8A8A",
  },
  fieldLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: "PretendardMedium",
    fontSize: 12,
    color: "#8A8A8A",
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    fontFamily: "PretendardRegular",
    fontSize: 13,
    color: "#1C1C1C",
  },
  nicknameInput: {
    height: 48,
    paddingLeft: 16,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
  },
  nicknameTextInput: {
    flex: 1,
    height: "100%",
    padding: 0,
    fontFamily: "PretendardRegular",
    fontSize: 13,
    color: "#1C1C1C",
  },
  checkText: {
    marginLeft: 12,
    fontFamily: "PretendardMedium",
    fontSize: 12,
    color: "#9A9A9A",
  },
  signupButton: {
    height: 52,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: "#F8D99C",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontFamily: "PretendardBold",
    fontSize: 15,
    color: "#1C1C1C",
  },
});