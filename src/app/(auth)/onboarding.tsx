import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usersApi } from "@/api";

const GIVE_OPTIONS = [
  "기획",
  "Frontend",
  "Backend",
  "AI/ML",
  "UI/UX",
  "Data",
  "마케팅",
  "디자인",
];

const INTEREST_OPTIONS = [
  "IT/AI",
  "기획",
  "디자인",
  "마케팅",
  "창업",
  "ESG",
  "헬스케어",
  "교육",
];

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "온라인",
];

const STEPS = [
  {
    title: "나의 GIVE를\n선택해주세요",
    description: "팀에 기여할 수 있는 역할 · 기술을 모두 골라주세요",
    options: GIVE_OPTIONS,
  },
  {
    title: "관심 분야를\n선택해주세요",
    description: "참여하고 싶은 프로젝트 · 공모전 분야를 골라주세요",
    options: INTEREST_OPTIONS,
  },
  {
    title: "선호 지역을\n선택해주세요",
    description: "활동 가능한 지역을 모두 골라주세요",
    options: REGION_OPTIONS,
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [giveFields, setGiveFields] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const selectedOptions =
    step === 0 ? giveFields : step === 1 ? interests : regions;

  const setSelectedOptions = (options: string[]) => {
    if (step === 0) {
      setGiveFields(options);
      return;
    }

    if (step === 1) {
      setInterests(options);
      return;
    }

    setRegions(options);
  };

  const handleSelect = (option: string) => {
    const updatedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedOptions);
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
      return;
    }

    setStep((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (selectedOptions.length === 0) {
      Alert.alert("선택 확인", "하나 이상 선택해주세요.");
      return;
    }

    if (!isLastStep) {
      setStep((prev) => prev + 1);
      return;
    }

    try {
      setIsSubmitting(true);

      await usersApi.saveOnboarding({
        giveFields,
        interests,
        regions,
      });

      router.replace("/");
    } catch (error) {
      Alert.alert(
        "저장 실패",
        error instanceof Error
          ? error.message
          : "온보딩 정보를 저장하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressArea}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                index <= step && styles.activeProgressBar,
              ]}
            />
          ))}
        </View>

        <View style={styles.backButtonArea}>
          {step > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Ionicons name="chevron-back" size={18} color="#1C1C1C" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>
        </View>

        <View style={styles.optionArea}>
          {currentStep.options.map((option) => {
            const isSelected = selectedOptions.includes(option);

            return (
              <Pressable
                key={option}
                style={[styles.option, isSelected && styles.selectedOption]}
                onPress={() => handleSelect(option)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.nextButton, isSubmitting && styles.disabledButton]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#1C1C1C" />
          ) : (
            <Text style={styles.nextButtonText}>
              {isLastStep ? "완료" : "다음"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
  },
  progressArea: {
    marginTop: 50,
    flexDirection: "row",
    gap: 3,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: "#EEEEEE",
  },
  activeProgressBar: {
    backgroundColor: "#F8D99C",
  },
  backButtonArea: {
    height: 56,
    justifyContent: "flex-end",
  },
  backButton: {
    width: 32,
    height: 32,
    marginLeft: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    marginTop: 20,
  },
  title: {
    fontFamily: "PretendardBold",
    fontSize: 24,
    lineHeight: 31,
    color: "#1C1C1C",
  },
  description: {
    marginTop: 10,
    fontFamily: "PretendardRegular",
    fontSize: 11,
    lineHeight: 17,
    color: "#8A8A8A",
  },
  optionArea: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    height: 36,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    borderColor: "#1C1C1C",
    backgroundColor: "#1C1C1C",
  },
  optionText: {
    fontFamily: "PretendardRegular",
    fontSize: 12,
    color: "#6F6F6F",
  },
  selectedOptionText: {
    fontFamily: "PretendardSemiBold",
    color: "#FFFFFF",
  },
  nextButton: {
    height: 50,
    marginTop: "auto",
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: "#F8D99C",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontFamily: "PretendardBold",
    fontSize: 14,
    color: "#1C1C1C",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
