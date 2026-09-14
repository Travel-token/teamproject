# API 오류 수정 후 실행 설정

코드 수정과 실제 DB·외부 서비스 설정은 별도로 적용합니다.

1. 대상 MySQL DB를 선택하고 다음 SQL을 순서대로 실행합니다. 기존 데이터 삭제 없이 누락 테이블·컬럼을 추가합니다.
   - src/main/resources/db/manual/20260906_android_integrations.sql
   - src/main/resources/db/manual/20260906_sessions_events.sql
2. Spring 실행 환경에 SESSION_REFRESH_SECRET을 32바이트 이상의 독립적인 비밀키로 설정합니다. 배포 간 동일한 값을 유지해야 하며 소스에 커밋하지 않습니다. 값이 없으면 서버는 명시적인 설정 오류로 기동을 중단합니다.
3. 개발 로그인 사용 시에만 AUTH_DEV_LOGIN_ENABLED=true를 설정합니다. four-features 프로필을 별도로 지정할 필요는 없습니다.
4. Spring OCR 프록시를 사용하려면 OCR_SERVICE_URL=http://OCR호스트:8001/ocr 를 설정합니다. 프론트가 Python을 직접 호출하는 현재 경로에는 EXPO_PUBLIC_OCR_BASE_URL=http://OCR호스트:8001 을 설정합니다.
5. 웹이 localhost 또는 127.0.0.1의 8081/8082 이외 주소에서 실행되면 APP_CORS_ALLOWED_ORIGINS와 OCR_CORS_ALLOWED_ORIGINS에 정확한 웹 Origin을 쉼표로 구분해 설정합니다. 지정한 목록이 기본 목록을 대체합니다.
6. 결제 알림 수집과 푸시는 기존처럼 기본 비활성입니다. DB·Android 설정이 완료된 환경에서만 PAYMENT_CAPTURE_ENABLED=true / PUSH_ENABLED=true로 활성화합니다. 기존 INTEGRATIONS_PAYMENT_CAPTURE_ENABLED / INTEGRATIONS_PUSH_ENABLED 환경변수도 지원합니다.

카카오페이·소셜 로그인·개인화 추천 기능은 이번 오류 수정에서 구현하거나 활성화하지 않았습니다.
