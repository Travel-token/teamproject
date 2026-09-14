# Android 배포 연동 설정

## 적용 순서

운영 DB에 기존 `20260906_android_integrations.sql`, `20260906_sessions_events.sql`을 적용한 다음 `20260911_oauth.sql`을 적용합니다.

## 소셜 로그인

Spring 환경변수에 아래 값을 설정합니다. Client secret은 앱이나 `EXPO_PUBLIC_*` 변수에 넣지 않습니다.

```text
AUTH_OAUTH_PUBLIC_BASE_URL=https://api.example.com
AUTH_OAUTH_APP_REDIRECT_URI=travelsettle://oauth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
KAKAO_OAUTH_CLIENT_ID=
KAKAO_OAUTH_CLIENT_SECRET=
NAVER_OAUTH_CLIENT_ID=
NAVER_OAUTH_CLIENT_SECRET=
```

각 공급자 콘솔의 Web callback URL은 다음과 같습니다.

```text
https://api.example.com/api/auth/oauth/google/callback
https://api.example.com/api/auth/oauth/kakao/callback
https://api.example.com/api/auth/oauth/naver/callback
```

Google은 `openid email profile`, Kakao는 이메일·닉네임, Naver는 이메일·이름(또는 닉네임) 제공 동의가 필요합니다. 운영 앱에서는 `EXPO_PUBLIC_ENABLE_DEV_LOGIN=false`와 `AUTH_DEV_LOGIN_ENABLED=false`를 사용합니다.

## 관광공사 검색

```text
TOUR_API_SERVICE_KEY=
TOUR_API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
TOUR_API_MOBILE_OS=AND
TOUR_API_APP_NAME=TravelSettle
```

키가 없거나 관광공사 요청이 실패하면 기존 DB 검색으로 자동 전환됩니다. 검색만 한 결과는 저장하지 않습니다. 사용자가 피드를 실제 작성하거나 추천 피드를 채택할 때 서버가 `contentId`를 관광공사 상세 API로 다시 검증하고, 같은 트랜잭션에서 `external_api_id=tour:{contentId}`로 `places`에 저장합니다.

## GPS 개인정보 최소화

앱은 낮은 정확도의 위치를 Android 기기에서 행정구역으로 역지오코딩하고 행정구역 문자열만 Spring에 전송합니다. 위도·경도는 서버 요청과 DB에 포함되지 않습니다. 백그라운드 위치 수집은 사용하지 않습니다.

## 추천 서버

```text
RECOMMENDATION_BASE_URL=http://recommendation-service:5050
RECOMMENDATION_DATA_DIR=/persistent/recommendation-data
```

Python 서버는 `/health`, `/recommendation/user/login`, `/recommend/logs`, `/recommend`, `/caption`을 제공합니다. Spring은 조회·좋아요·생성·수정 이벤트를 전달하며, 인기순 피드를 사용자 행동 가중치로 재정렬합니다. Python 서버 장애 시 기존 인기순과 템플릿 캡션으로 자동 전환됩니다.

## 카카오페이

베타 앱에서는 결제 링크 매핑과 프론트 버튼을 주석 상태로 유지합니다. 결제 알림 수집 기능은 카카오페이 결제 API와 별개이며 `PAYMENT_CAPTURE_ENABLED=true`로 켭니다.
