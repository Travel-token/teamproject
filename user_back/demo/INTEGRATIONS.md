# 외부 연동 설정

소셜 로그인 및 카카오페이 실제 키는 이후 추가한다. 현재 소셜 로그인 엔드포인트는 501을 반환하며 인증 성공으로 처리하지 않는다. OAuth 앱 등록(redirect URI, 앱 ID, secret)과 공급자별 토큰 검증 구현이 남아 있다.

OCR은 외부 HTTP API 계약을 구현했다. 환경변수 INTEGRATIONS_OCR_URL, 선택 INTEGRATIONS_OCR_API_KEY를 설정한다. 요청은 multipart/form-data의 file 1개이며 키가 있으면 Authorization: Bearer로 전송한다. 응답 JSON:

    {"name":"식당명","amount":12000,"spentAt":"2026-09-06T12:30:00","categoryCode":"meal","confidence":0.95}

name, amount 필수. 날짜/카테고리/신뢰도는 선택. 외부 OCR 서비스의 포맷이 다르면 IntegrationController에서 변환한다. 프론트에서 결과를 확인한 후에만 지출 저장 요청을 보낸다. 설정이 없으면 503, 공급자 오류는 502. 최대 10MB, 응답 대기 30초.

INTEGRATIONS_PAYMENT_LINK_URL은 향후 구현할 결제 연결 서비스의 HTTPS URL이다. routeId/tripId를 전달하며, 단순 이동으로 송금 완료를 처리하지 않는다. 실제 카카오페이 공급자 연동은 별도로 추가해야 한다.

문자 결제 수집 및 기기 푸시는 공급자/플랫폼 연동 전이므로 설정 저장만으로 활성화됐다고 표시하면 안 된다. 정산 인앱 알림은 DB에 생성된다.
