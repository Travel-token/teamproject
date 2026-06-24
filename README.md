# Travel Token (React Native / Expo)

원본 HTML 디자인(`travel_token_v5_피드_on.html`)을 **Expo + expo-router + JavaScript** 기반 React Native 앱으로 변환한 프로젝트입니다.
백엔드는 Spring Boot로 별도 구축하는 것을 가정하며, 이 레포는 **프론트엔드만** 포함합니다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Expo (managed workflow) |
| 라우팅 | expo-router (파일 기반 라우팅) |
| 언어 | JavaScript |
| 상태관리 | React Context API (`AuthContext`, `TripContext`, `ToastContext`) |
| 서버 통신 | Axios |
| 아이콘 | @expo/vector-icons (Ionicons) |
| 벡터 그래픽 | react-native-svg (배너 일러스트, 도넛 차트, 동선 지도) |

## 폴더 구조

```
travel-token-rn/
├─ app/                        # expo-router 파일 기반 라우트
│  ├─ _layout.js               # 루트 레이아웃 (Provider 트리, Stack 분기)
│  ├─ index.js                 # 진입점: 로그인 여부에 따라 리다이렉트
│  ├─ (auth)/
│  │  ├─ _layout.js
│  │  └─ login.js              # 로그인 화면 (원본 #s-login)
│  ├─ (tabs)/                  # 하단 탭 3개 (피드 / 메인홈 / 여행기록)
│  │  ├─ _layout.js
│  │  ├─ home.js               # 원본 #s-home
│  │  ├─ explore.js            # 원본 #s-explore (피드 그리드)
│  │  ├─ trips.js              # 원본 #s-trips (여행기록 목록)
│  │  └─ profile.js            # 원본 #s-profile (탭바엔 숨김, 홈에서 진입)
│  ├─ trip/
│  │  ├─ _layout.js
│  │  ├─ index.js              # 원본 #s-trip (여행 상세: 지출/정산/동선 탭)
│  │  ├─ expenses.js           # 원본 #s-expenses (지출 내역 + 필터)
│  │  ├─ new.js                # 원본 #s-newtrip (3단계 위저드)
│  │  ├─ stats.js              # 원본 #s-stats (카테고리/멤버별 분석)
│  │  └─ past/[id].js          # 종료된 여행 상세
│  ├─ feed/
│  │  ├─ _layout.js
│  │  ├─ [id].js               # 원본 #s-feeddetail
│  │  └─ write/
│  │     ├─ step1.js           # 원본 #s-feedwrite1 (장소 선택)
│  │     ├─ step2.js           # 원본 #s-feedwrite2 (사진/캡션)
│  │     └─ step3.js           # 원본 #s-feedwrite3 (미리보기/게시)
│  └─ settle/
│     ├─ _layout.js
│     ├─ index.js              # 원본 #s-settle (정산 메인)
│     └─ ai-chat.js            # 원본 #s-ai-chat (AI 정산 어시스턴트)
│
├─ src/
│  ├─ api/                     # ⭐ Spring Boot 연동 지점 (Axios 함수들)
│  │  ├─ client.js             # Axios 인스턴스 + JWT 인터셉터
│  │  ├─ authApi.js            # 로그인/로그아웃/탈퇴/프로필
│  │  ├─ tripApi.js            # 여행/지출/멤버/송금 CRUD
│  │  ├─ settleApi.js          # 정산 계산/완료/AI챗
│  │  └─ feedApi.js            # 피드 목록/상세/좋아요/게시
│  │
│  ├─ context/                 # 전역 상태 (Context API)
│  │  ├─ AuthContext.js        # 로그인 상태, 약관 동의
│  │  ├─ TripContext.js        # 활성 여행, 지출, 멤버, 알림, 정산 상태
│  │  └─ ToastContext.js       # 전역 토스트 (원본 toast() 대응)
│  │
│  ├─ components/
│  │  ├─ common/               # 버튼, 카드, 인풋, 모달 등 범용 컴포넌트
│  │  ├─ home/                 # 홈 화면 전용 (히어로 카드, GPS/결제 배너)
│  │  ├─ trip/                 # 여행 상세/통계/신규생성 전용
│  │  ├─ settle/               # 정산/AI챗 전용
│  │  ├─ feed/                 # 피드 그리드 아이템
│  │  └─ modals/               # 바텀시트 모달 모음 (지출추가, 친구초대 등)
│  │
│  ├─ constants/
│  │  ├─ theme.js              # 색상/spacing/radius/폰트 — 원본 CSS 변수 1:1 매핑
│  │  └─ config.js             # API_BASE_URL, enum 상수
│  │
│  ├─ data/
│  │  └─ mockData.js           # 백엔드 연동 전 화면 채움용 목업 (원본 STATE 대응)
│  │
│  └─ utils/
│     └─ format.js             # 통화/조회수/날짜 포맷터
│
├─ app.json
├─ babel.config.js
├─ package.json
└─ .env.example
```

## 실행 방법

```bash
npm install
cp .env.example .env   # EXPO_PUBLIC_API_BASE_URL을 백엔드 주소로 수정
npm start
```

- iOS 시뮬레이터: `npm run ios` / Android 에뮬레이터: `npm run android`
- 실기기 테스트: Expo Go 앱으로 QR 스캔

## Spring Boot 백엔드 연동 가이드

`src/api/*.js` 파일들에 **예상 엔드포인트와 요청/응답 형태**를 주석으로 명시해두었습니다.
백엔드가 준비되면 아래 순서로 연동하면 됩니다.

1. **`.env`의 `EXPO_PUBLIC_API_BASE_URL`을 실제 서버 주소로 설정**
   - Android 에뮬레이터에서 로컬 서버 접근 시 `http://10.0.2.2:8080/api` 사용
2. **`src/api/client.js`** — Axios 베이스 설정. JWT는 `expo-secure-store`에 저장되고 모든 요청에 자동 첨부됩니다.
3. **인증 흐름** (`authApi.js` + `AuthContext.js`)
   - 현재는 소셜 로그인 버튼 클릭 → 약관 동의 모달 → mock 로그인 처리
   - 실제 OAuth는 `expo-auth-session` 등으로 provider token을 얻은 뒤 `loginWithProvider(provider, token)`에 전달하도록 `AuthContext.startLogin`을 확장하세요
4. **여행/지출 데이터** (`tripApi.js` + `TripContext.js`)
   - `TripContext`는 앱 시작 시 `fetchActiveTrip()` / `fetchExpenses()`를 호출하고, 실패 시 `src/data/mockData.js`로 폴백합니다
   - 백엔드가 준비되면 폴백 동작은 자연히 사용되지 않게 되며, 별도 코드 수정 없이 실데이터로 전환됩니다
5. **정산** (`settleApi.js`) — AI 추천 송금 경로, 정산 완료/되돌리기, AI 챗(`/api/ai/chat`)
6. **피드** (`feedApi.js`) — 정렬별 피드 조회, 좋아요, 게시(multipart)

### 목업 데이터에 대해
`src/data/mockData.js`는 화면을 비워두지 않기 위한 임시 데이터입니다. 백엔드 연동이 끝나면 이 파일은 더 이상 import되지 않도록 점진적으로 제거하면 됩니다 (현재는 각 Context의 `useState` 초기값으로만 사용됨).

## 원본 디자인과의 매핑 요약

| 원본 HTML 화면 ID | RN 라우트 |
|---|---|
| `#s-login` | `app/(auth)/login.js` |
| `#s-home` | `app/(tabs)/home.js` |
| `#s-explore` | `app/(tabs)/explore.js` |
| `#s-trips` | `app/(tabs)/trips.js` |
| `#s-profile` | `app/(tabs)/profile.js` |
| `#s-trip` | `app/trip/index.js` |
| `#s-expenses` | `app/trip/expenses.js` |
| `#s-newtrip` | `app/trip/new.js` |
| `#s-stats` | `app/trip/stats.js` |
| `#s-settle` | `app/settle/index.js` |
| `#s-ai-chat` | `app/settle/ai-chat.js` |
| `#s-feeddetail` | `app/feed/[id].js` |
| `#s-feedwrite1/2/3` | `app/feed/write/step1~3.js` |
| `#m-*` (각종 모달) | `src/components/modals/*.js` |

## 알려진 제약 / 추후 보완 포인트

- **결제 알림 자동 감지**(`PaymentDetectBanner`)는 안드로이드 알림 리스너 권한이 필요한 기능으로, 현재는 UI만 구현되어 있고 실제 알림 수신 로직은 비어 있습니다.
- **영수증 OCR**은 UI 흐름만 mock으로 구현되어 있으며, 실제 이미지 업로드는 `expo-image-picker` 연동이 필요합니다 (`tripApi.uploadReceiptOCR` 함수는 준비되어 있음).
- **다크모드**는 `theme.js`에 `darkColors` 팔레트만 준비되어 있고, 실제 테마 스위칭 로직(Context 연동)은 아직 적용되지 않았습니다.
- masonry 그리드(피드)는 RN에 동일 기능이 없어 2열 `FlatList` 그리드로 단순화했습니다.
