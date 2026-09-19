# GUHAM Frontend

Expo Router 기반 GUHAM 모바일·웹 프론트엔드입니다. 백엔드 주소는 Vite의 `import.meta.env`가 아니라 Expo 방식인 `process.env.EXPO_PUBLIC_API_URL`로 읽습니다.

## 실행

```bash
npm install
copy .env.example .env
npm run web
```

`.env`의 주소는 실행 환경에 따라 바꿉니다.

```dotenv
# Expo Web 또는 iOS 시뮬레이터
EXPO_PUBLIC_API_URL=http://localhost:3000

# Android 에뮬레이터
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# 실제 휴대폰(PC와 같은 Wi-Fi)
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

실제 휴대폰에서는 `localhost`가 휴대폰 자신을 가리키므로 PC의 사설 IP를 써야 합니다. 백엔드는 `npm run dev`로 실행하고 Windows 방화벽에서 Node.js의 사설 네트워크 접근을 허용합니다.

`EXPO_PUBLIC_*` 값은 앱 번들에 포함됩니다. AI API 키, Supabase secret/service-role 키는 프론트 `.env`에 넣지 말고 백엔드에서만 관리합니다.

## 폴더 구조

```text
frontend/
├─ assets/                    # 로고, 아이콘, 폰트 등 정적 파일
├─ src/
│  ├─ app/                   # Expo Router 화면 및 URL 구조
│  │  ├─ (auth)/             # 로그인, 회원가입, 온보딩
│  │  ├─ index.tsx           # 홈
│  │  ├─ write.tsx           # 포스팅 작성
│  │  ├─ post-detail.tsx     # 포스팅 상세
│  │  ├─ chat-list.tsx       # 채팅방 목록
│  │  ├─ chat.tsx            # 채팅방
│  │  └─ mypage.tsx          # 마이페이지
│  ├─ api/
│  │  ├─ client.ts           # 공통 apiFetch, 인증 헤더, 토큰 갱신
│  │  ├─ auth.ts             # 로그인·회원가입·닉네임 확인
│  │  ├─ users.ts            # 온보딩·마이페이지
│  │  ├─ boards.ts           # 게시글 CRUD·multipart 이미지
│  │  ├─ ai.ts               # AI 초안·게시글/사용자 추천
│  │  ├─ chat.ts             # 채팅 REST API
│  │  ├─ socket.ts           # Socket.IO 실시간 채팅
│  │  ├─ notifications.ts    # 알림
│  │  └─ types.ts            # 공통 API 타입
│  ├─ auth/session.ts        # 네이티브 SecureStore·웹 localStorage 토큰 저장
│  ├─ components/            # 재사용 UI 컴포넌트
│  ├─ constants/             # 색상 등 상수
│  └─ hooks/                 # 공통 React 훅
├─ .env.example
└─ package.json
```

## 연동 흐름

1. 로그인 응답의 access/refresh token을 `sessionStore`에 저장합니다.
2. `apiFetch(..., { auth: true })`가 Bearer 토큰을 자동 첨부합니다.
3. 401이면 refresh token으로 한 번 재발급한 뒤 원래 요청을 재시도합니다.
4. 게시글과 AI 초안의 이미지는 `FormData`로 전송하며 `Content-Type`은 런타임이 boundary까지 자동 설정합니다.
5. 채팅은 과거 내역을 REST로 받은 뒤 `createChatSocket()`으로 `/chat` Socket.IO 경로에 연결합니다.

## 백엔드와 함께 확인

```bash
# backend/backend
npm run dev

# frontend
npm run web
```

브라우저 개발자 도구 Network에서 로그인 요청이 `http://localhost:3000/api/auth/login`으로 가는지 확인합니다. Expo Web origin은 백엔드 `CORS_ORIGIN`에 포함되어야 합니다.
