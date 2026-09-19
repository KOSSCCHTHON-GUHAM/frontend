// 백엔드 서버 주소를 여기서 관리해요.
// - 웹 브라우저(같은 컴퓨터)에서 테스트: "http://localhost:3000"
// - 폰(Expo Go)에서 테스트: 컴퓨터의 실제 IP 주소로 바꿔야 해요.
//   (cmd에서 ipconfig 쳐서 나오는 IPv4 주소, 예: "http://172.20.10.2:3000")
export const API_BASE_URL = "http://localhost:3000";

// 로그인 토큰을 저장해두는 자리예요. 로그인 기능을 만들 때 이 값을 채우면 돼요.
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

// 백엔드에 요청 보낼 때 공통으로 쓰는 함수예요.
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `요청에 실패했어요 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // 응답이 JSON이 아니면 기본 메시지를 그대로 써요.
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
