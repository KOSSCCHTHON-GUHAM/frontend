import { Stack } from "expo-router";

// 앱 전체의 기본 틀이에요.
// 지금은 상단 바 없이 각 화면(index, mypage 등)을 그대로 보여주도록 설정했어요.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
