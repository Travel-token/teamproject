# PC 자가호스팅 구성

외부에는 ngrok가 전달하는 Spring Boot `127.0.0.1:8080`만 공개한다. MySQL `3306`, 추천 서버 `5050`, OCR 서버 `8001`은 PC 내부에서만 사용한다.

## 최초 준비

1. MySQL에 `travel_app` 전용 계정을 만들고 `travel_token` 데이터베이스 권한만 부여한다.
2. `ops/initialize-self-hosted.ps1`을 실행한다. 서버 내부 비밀키는 자동 생성되며 `.env.server`와 `.env.build`가 만들어진다.
3. 추천 서버용 Python 3.11 가상환경에 `algorithm_server/requirements.txt`를 설치한다.
4. OCR용 Python 3.11 가상환경에 PaddlePaddle과 `algorithm_server/receipt-ocr/requirements.txt`를 설치한다.
5. ngrok 계정의 자동 할당 개발 도메인과 인증 토큰을 설정한다.
6. OAuth 공급자 Callback URL을 아래 형식으로 등록한다.

```text
https://할당도메인.ngrok-free.app/api/auth/oauth/google/callback
https://할당도메인.ngrok-free.app/api/auth/oauth/kakao/callback
https://할당도메인.ngrok-free.app/api/auth/oauth/naver/callback
```

## 실행

MySQL 서비스를 먼저 시작한 다음 PowerShell에서 실행한다.

```powershell
.\ops\initialize-self-hosted.ps1
# 생성된 .env.server와 .env.build의 CHANGE_ME 및 외부 서비스 값을 입력한 후
.\ops\start-self-hosted.ps1
.\ops\check-self-hosted.ps1
```

Android EAS 빌드에는 ngrok HTTPS 주소 하나만 넣는다.

```text
EXPO_PUBLIC_API_BASE_URL=https://할당도메인.ngrok-free.app
```

`EXPO_PUBLIC_OCR_BASE_URL`은 사용하지 않는다. Android의 영수증 이미지는 인증된 Spring API를 거쳐 내부 OCR 서버로 전달된다.

## 운영 주의사항

- 공유기 포트포워딩으로 3306, 5050, 8001, 8080을 열지 않는다.
- `.env.server`, `google-services.json`, OAuth 비밀키를 Git에 넣지 않는다.
- Windows 절전 모드를 끄고 서비스 로그와 MySQL, 업로드, 추천 데이터 폴더를 백업한다.
- 무료 ngrok 한도를 초과하거나 PC/인터넷이 꺼지면 앱 API가 중단된다.
